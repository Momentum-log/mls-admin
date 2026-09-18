"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getIdentifyErrorMessage,
  useIdentifyAdmin,
  useRequestOtp,
  useStaffLogin,
  useVerifyBackupCode,
  useVerifyOtp,
  useVerifyTotp,
} from "@/hooks/auth/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SessionNotice } from "@/components/auth/session-notice";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Smartphone,
} from "lucide-react";
import { LoginBackground } from "@/components/login-background";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { AdminIdentity } from "@/types/auth";

/**
 * Seconds before an emailed code can be requested again.
 * The server throttles to one per minute, so asking sooner only earns a
 * silent no-op.
 */
const RESEND_COOLDOWN_SECONDS = 60;

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const sixDigitSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

const backupSchema = z.object({
  code: z.string().min(1, "Enter one of your backup codes"),
});

/** Which credential is being collected. */
type Step = "email" | "password" | "otp" | "totp" | "backup";

/**
 * The address the remaining steps are working on, with a way back.
 *
 * Every step after the first is about one specific account, and getting the
 * address wrong is the most likely reason to be stuck — so it stays on screen
 * and stays changeable.
 */
function AccountChip({
  email,
  onChange,
  disabled,
}: {
  email: string;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">Signing in as</p>
        <p className="truncate text-sm font-semibold text-gray-900">{email}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand-blue transition-colors hover:text-blue-700 disabled:text-gray-400"
      >
        <ArrowLeft className="h-3 w-3" />
        Change
      </button>
    </div>
  );
}

/**
 * Admin sign-in.
 *
 * One email field to start. The server decides what to ask for next: the
 * Super Administrator gets a one-time code, already sent by the time the step
 * renders; a staff admin gets a password field; an address belonging to
 * neither is refused before any credential is collected.
 *
 * Note the trade this makes. The lookup necessarily tells an unauthenticated
 * caller whether an address is an admin, and which kind — the identical-202
 * behaviour of `/otp/request` deliberately refused to. What it buys is that
 * codes are never dispatched to addresses that cannot use them.
 */
export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [identity, setIdentity] = useState<AdminIdentity>();
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { mutate: identify, isPending: isIdentifying } = useIdentifyAdmin();
  const { mutate: staffLogin, isPending: isStaffPending } = useStaffLogin();
  const { mutate: requestOtp, isPending: isRequesting } = useRequestOtp();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp();
  const { mutate: verifyTotp, isPending: isVerifyingTotp } = useVerifyTotp();
  const { mutate: verifyBackup, isPending: isVerifyingBackup } =
    useVerifyBackupCode();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const otpForm = useForm<z.infer<typeof sixDigitSchema>>({
    resolver: zodResolver(sixDigitSchema),
    defaultValues: { code: "" },
  });

  const totpForm = useForm<z.infer<typeof sixDigitSchema>>({
    resolver: zodResolver(sixDigitSchema),
    defaultValues: { code: "" },
  });

  const backupForm = useForm<z.infer<typeof backupSchema>>({
    resolver: zodResolver(backupSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const email = identity?.email ?? "";
  /** Whether a usable code is sitting in the inbox for this address. */
  const hasLiveCode = Boolean(
    identity?.codeSent || identity?.codeAlreadyPending,
  );
  /** "10 minutes", from the server's own figure when it sends one. */
  const codeValidityLabel = (() => {
    const seconds = identity?.expiresInSeconds ?? 600;
    const minutes = Math.round(seconds / 60);
    return minutes >= 1
      ? `${minutes} minute${minutes === 1 ? "" : "s"}`
      : `${seconds} seconds`;
  })();

  /** Looks the address up and moves to whichever credential it needs. */
  function onIdentify(values: z.infer<typeof emailSchema>) {
    identify(values, {
      onSuccess: (result) => {
        setIdentity(result);
        setStep(result.method === "OTP" ? "otp" : "password");
        // The lookup sends the code itself, so the resend gate starts counting
        // from here rather than from a request this page made. On the
        // throttled path the server says how much of its window is left, so
        // the button unlocks when it can actually do something.
        if (result.codeSent || result.codeAlreadyPending) {
          setCooldown(
            result.retryAfterSeconds && result.retryAfterSeconds > 0
              ? Math.ceil(result.retryAfterSeconds)
              : RESEND_COOLDOWN_SECONDS,
          );
        }
      },
      onError: (error) => {
        // Also pinned to the field: the toast leaves, and the address is the
        // thing that has to change.
        emailForm.setError("email", { message: getIdentifyErrorMessage(error) });
      },
    });
  }

  /** Returns to the address step, clearing every credential field. */
  function restart() {
    setStep("email");
    setIdentity(undefined);
    setCooldown(0);
    setShowPassword(false);
    passwordForm.reset();
    otpForm.reset();
    totpForm.reset();
    backupForm.reset();
  }

  /**
   * Jumps straight to the authenticator without a lookup.
   *
   * The authenticator exists for the case where email is unavailable, and the
   * lookup sends an email on the Super Admin path — so routing this escape
   * hatch through it would tie the one path that survives an outage to the
   * thing that is down.
   */
  function skipToAuthenticator() {
    const typed = emailForm.getValues("email");
    if (!emailSchema.safeParse({ email: typed }).success) {
      emailForm.setError("email", {
        message: "Enter your email address first",
      });
      return;
    }
    setIdentity({
      email: typed,
      method: "OTP",
      codeSent: false,
      codeAlreadyPending: false,
    });
    setStep("totp");
  }

  const headings: Record<Step, { title: string; blurb: string }> = {
    email: {
      title: "Admin Login",
      blurb: "Enter your email to continue.",
    },
    password: {
      title: "Enter your password",
      blurb: "This account signs in with a password.",
    },
    otp: {
      title: "Check your email",
      blurb: identity?.codeAlreadyPending
        ? "A code is already waiting in your inbox and is still valid — we didn't send a new one."
        : `We sent a 6-digit code. It is valid for ${codeValidityLabel}.`,
    },
    totp: {
      title: "Authenticator code",
      blurb: "Open your authenticator app and enter the current code.",
    },
    backup: {
      title: "Backup code",
      blurb: "Use one of the codes saved when you enrolled.",
    },
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
      {/* Left Panel: Branding & Background (Visible only on desktop) */}
      <div className="relative hidden w-1/2 flex-col items-start justify-center lg:flex border-r border-gray-100 overflow-hidden">
        <LoginBackground />

        <div className="relative z-10 flex flex-col items-start text-left p-16 max-w-2xl">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Landscape Logo */}
              <div className="mb-12">
                <div className="relative h-16 w-64">
                  <Image
                    src="/images/logo-landscape.svg"
                    alt="Momentum Logistics"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </div>

              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 font-secondary tracking-tight leading-tight">
                Global Logistics, <br />
                <span className="text-brand-blue">Simplified</span>.
              </h2>

              <p className="text-gray-600 leading-relaxed text-lg mb-12 font-primary max-w-lg">
                The Momentum Administration Suite provides precision tools for
                tracking, route optimization, and operational excellence.
                <span className="block mt-6 p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10 text-brand-blue font-medium text-base">
                  Start with your email. We will ask for whatever your account
                  signs in with — a password, or a one-time code sent to you.
                </span>
              </p>

              <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                {[
                  { label: "Real-time Fleet Tracking", icon: "📦" },
                  { label: "End-to-End Security", icon: "🛡️" },
                  { label: "Predictive Analytics", icon: "📊" },
                  { label: "Global Partner Network", icon: "🌐" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                  >
                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">
                      {item.icon}
                    </span>
                    <span className="text-sm font-bold text-gray-700 font-primary">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom indicator */}
        <div className="absolute bottom-12 left-16 right-12 flex justify-between items-center text-sm text-gray-400 font-medium z-10 font-primary">
          <span>© 2026 Momentum Logistics Service</span>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile Logo */}
          <div className="mb-12 flex items-center justify-center lg:hidden">
            <div className="relative h-12 w-48">
              <Image
                src="/images/logo-landscape.svg"
                alt="Momentum Logistics"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <SessionNotice />

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {headings[step].title}
            </h2>
            <p className="text-gray-500">{headings[step].blurb}</p>
          </div>

          {step === "email" ? (
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onIdentify)}
                className="space-y-6"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="username"
                          autoFocus
                          placeholder="name@momentumlogistics.pl"
                          className="h-12 border-gray-200 focus:border-brand-blue focus:ring-brand-blue/10 bg-gray-50/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-brand-blue hover:bg-[#004d94] text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-blue/20 group"
                  disabled={isIdentifying}
                >
                  {isIdentifying ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={skipToAuthenticator}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-brand-blue"
                  >
                    <Smartphone className="h-4 w-4" />
                    Use an authenticator app instead
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    The authenticator does not depend on email — use it if mail
                    delivery is down.
                  </p>
                </div>
              </form>
            </Form>
          ) : step === "password" ? (
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit((values) =>
                  staffLogin({ email, password: values.password }),
                )}
                className="space-y-6"
              >
                <AccountChip
                  email={email}
                  onChange={restart}
                  disabled={isStaffPending}
                />

                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            autoFocus
                            placeholder="••••••••"
                            className="h-12 border-gray-200 focus:border-brand-blue focus:ring-brand-blue/10 bg-gray-50/50 pr-12"
                            {...field}
                          />
                          <button
                            type="button"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors p-2"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-brand-blue hover:bg-[#004d94] text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-blue/20 group"
                  disabled={isStaffPending}
                >
                  {isStaffPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Lost your password? Ask the Super Administrator to reissue it
                  — there is no self-service reset.
                </p>
              </form>
            </Form>
          ) : step === "otp" ? (
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit((values) =>
                  verifyOtp({ email, otp: values.code }),
                )}
                className="space-y-6"
              >
                <AccountChip
                  email={email}
                  onChange={restart}
                  disabled={isVerifyingOtp}
                />

                <FormField
                  control={otpForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        6-Digit Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          autoFocus
                          placeholder="000000"
                          maxLength={6}
                          className="h-14 text-center text-2xl font-mono tracking-[0.5em] border-gray-200 focus:border-brand-blue focus:ring-brand-blue/10 bg-gray-50/50"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-brand-blue hover:bg-[#004d94] text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-blue/20 group"
                  disabled={isVerifyingOtp}
                >
                  {isVerifyingOtp ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Verify &amp; Sign In
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    disabled={cooldown > 0 || isRequesting}
                    onClick={() => {
                      requestOtp(
                        { email },
                        { onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS) },
                      );
                    }}
                    className="text-sm font-semibold text-brand-blue transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {cooldown > 0
                      ? `Resend code in ${cooldown}s`
                      : "Resend code"}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    A new code retires the previous one. Codes allow three
                    attempts.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep("totp")}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-brand-blue"
                  >
                    <Smartphone className="h-4 w-4" />
                    Use an authenticator app
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("backup")}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-brand-blue"
                  >
                    <KeyRound className="h-4 w-4" />
                    Use a backup code
                  </button>
                </div>
              </form>
            </Form>
          ) : step === "totp" ? (
            <Form {...totpForm}>
              <form
                onSubmit={totpForm.handleSubmit((values) =>
                  verifyTotp({ email, code: values.code }),
                )}
                className="space-y-6"
              >
                <AccountChip
                  email={email}
                  onChange={restart}
                  disabled={isVerifyingTotp}
                />

                <FormField
                  control={totpForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        6-Digit Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          autoFocus
                          placeholder="000000"
                          maxLength={6}
                          className="h-14 text-center text-2xl font-mono tracking-[0.5em] border-gray-200 focus:border-brand-blue focus:ring-brand-blue/10 bg-gray-50/50"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-brand-blue hover:bg-[#004d94] text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-blue/20 group"
                  disabled={isVerifyingTotp}
                >
                  {isVerifyingTotp ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Verify &amp; Sign In
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep("backup")}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-brand-blue"
                  >
                    <KeyRound className="h-4 w-4" />
                    Use a backup code
                  </button>
                  {hasLiveCode && (
                    <button
                      type="button"
                      onClick={() => setStep("otp")}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <Mail className="h-3 w-3" />
                      Back to emailed code
                    </button>
                  )}
                </div>
              </form>
            </Form>
          ) : (
            <Form {...backupForm}>
              <form
                onSubmit={backupForm.handleSubmit((values) =>
                  verifyBackup({ email, code: values.code }),
                )}
                className="space-y-6"
              >
                <AccountChip
                  email={email}
                  onChange={restart}
                  disabled={isVerifyingBackup}
                />

                <FormField
                  control={backupForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Backup Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          autoFocus
                          placeholder="K7M2P-9XQ4B"
                          className="h-14 text-center text-lg font-mono tracking-widest border-gray-200 focus:border-brand-blue focus:ring-brand-blue/10 bg-gray-50/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
                  Each backup code works once. Case, spacing, and the dash are
                  ignored, so type it however it was written down.
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-brand-blue hover:bg-[#004d94] text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-blue/20 group"
                  disabled={isVerifyingBackup}
                >
                  {isVerifyingBackup ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Verify &amp; Sign In
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep("totp")}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-brand-blue"
                  >
                    <Smartphone className="h-4 w-4" />
                    Use an authenticator app
                  </button>
                </div>
              </form>
            </Form>
          )}

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-center text-sm text-gray-400">
              Only one session may be active per admin. Signing in here ends any
              session elsewhere.
              <br />
              All login attempts are logged for security purposes.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
