"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@/hooks/auth/use-auth";
import { useRotatePassword } from "@/hooks/admin/use-security";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Shield, Key, Eye, EyeOff } from "lucide-react";
import { LoginBackground } from "@/components/login-background";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * LoginPage redesigned with a split-screen premium layout.
 * Left: Dynamic branding and background.
 * Right: Clean, professional login form.
 */
export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const { mutate: rotatePassword, isPending: isRotating } = useRotatePassword();

  const [isRotationOpen, setIsRotationOpen] = useState(false);
  const [resetKey, setResetKey] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetKey, setShowResetKey] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values);
  }

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
                  If you have not received an email with your credentials, you
                  cannot log in to this portal. Users that are on this page
                  would have to have received their email and, for their login
                  credentials, use their email and password for login before
                  they can successfully log in through this portal.
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

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Login
            </h2>
            <p className="text-gray-500">
              Please enter your credentials to access the management panel
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@momentumlogistics.pl"
                          className="h-12 border-gray-200 focus:border-brand-blue focus:ring-brand-blue/10 bg-gray-50/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-gray-700 font-medium">
                          Password
                        </FormLabel>
                        <button
                          type="button"
                          className="text-xs font-semibold text-brand-blue hover:text-blue-700 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 border-gray-200 focus:border-brand-blue focus:ring-brand-blue/10 bg-gray-50/50 pr-12"
                            {...field}
                          />
                          <button
                            type="button"
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
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-brand-blue hover:bg-[#004d94] text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-blue/20 group"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Dialog open={isRotationOpen} onOpenChange={setIsRotationOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-sm font-bold text-destructive hover:text-red-700 transition-colors flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Rotate Super Admin Access
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-blue" />
                    Emergency Rotation
                  </DialogTitle>
                  <DialogDescription>
                    Lost access? Use your 8-character Weekly Reset Key to
                    trigger a credentials refresh.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">
                      Weekly Reset Key
                    </Label>
                    <div className="relative group">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-brand-blue" />
                      <Input
                        type={showResetKey ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-12 h-12 font-mono tracking-widest text-lg"
                        value={resetKey}
                        onChange={(e) =>
                          setResetKey(e.target.value.toUpperCase().slice(0, 8))
                        }
                        maxLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetKey(!showResetKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors p-2"
                      >
                        {showResetKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 border border-blue-100 italic">
                    Note: Rotating will immediately invalidate the current Super
                    Admin password. New credentials will be sent to your email.
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full h-11 font-bold rounded-xl"
                    disabled={resetKey.length < 8 || isRotating}
                    onClick={() => setIsConfirmOpen(true)}
                  >
                    {isRotating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Trigger Rotation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ConfirmDialog
            open={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            title="Confirm Emergency Rotation?"
            description="This action cannot be undone. All active Super Admin sessions will be terminated. Do you have access to your email?"
            confirmLabel="Rotate Now"
            destructive
            isLoading={isRotating}
            onConfirm={() => {
              rotatePassword(resetKey, {
                onSuccess: () => {
                  setResetKey("");
                  setIsConfirmOpen(false);
                  setIsRotationOpen(false);
                },
                onError: () => {
                  setIsConfirmOpen(false);
                },
              });
            }}
          />

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-center text-sm text-gray-400">
              Secure authentication for authorized personnel only.
              <br />
              All login attempts are logged for security purposes.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
