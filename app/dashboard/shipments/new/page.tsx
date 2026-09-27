"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUsers } from "@/hooks/users/use-users";
import { useShippingQuote } from "@/hooks/shipping/use-shipping";
import {
  useCreateProxyShipment,
  useBypassPayment,
} from "@/hooks/shipments/use-shipments";
import { useDebounce } from "@/hooks/use-debounce";
import { User } from "@/types/user";
import type {
  ShippingRate,
  CarrierAddress,
} from "@/types/shipping-estimate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Search,
  Package,
  MapPin,
  Truck,
  CheckCircle,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/format-currency";

/** Steps in the shipment creation flow. */
const STEPS = [
  { id: 1, label: "Select User", icon: UserIcon },
  { id: 2, label: "Addresses", icon: MapPin },
  { id: 3, label: "Package", icon: Package },
  { id: 4, label: "Rates", icon: Truck },
  { id: 5, label: "Confirm", icon: CheckCircle },
] as const;

/** Default address state for the form inputs. */
const emptyAddress = {
  street1: "",
  street2: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "",
  residential: false,
};

type AddressForm = typeof emptyAddress;

/**
 * Maps the wizard's flat form state onto the canonical address every
 * carrier-facing endpoint expects.
 *
 * The API has no concept of `street1`/`street2`/`state` — it takes a
 * `streetLines` array (max 3, carriers reject more) and `stateOrProvinceCode`.
 *
 * @param form - Flat form state.
 * @returns The canonical carrier address.
 */
function toCarrierAddress(form: AddressForm): CarrierAddress {
  return {
    streetLines: [form.street1, form.street2]
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3),
    city: form.city.trim(),
    stateOrProvinceCode: form.state.trim() || undefined,
    postalCode: form.postalCode.trim(),
    countryCode: form.countryCode.trim().toUpperCase(),
    residential: form.residential,
  };
}

/**
 * Multi-step shipment creation page.
 * Flow: Select User → Addresses → Package → Get Rates → Confirm & Create.
 * Supports auto-selecting a user via ?userCode= query parameter.
 */
export default function CreateShipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUserCode = searchParams.get("userCode");

  // Steps
  const [step, setStep] = useState(1);

  // Step 1: User selection
  const [userSearch, setUserSearch] = useState("");
  const debouncedUserSearch = useDebounce(userSearch, 500);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Step 2: Addresses
  const [pickup, setPickup] = useState({ ...emptyAddress, countryCode: "PL" });
  const [dropoff, setDropoff] = useState({ ...emptyAddress });

  // Step 3: Package
  const [weight, setWeight] = useState<{ value: number; units: "KG" | "LB" }>({
    value: 0,
    units: "KG",
  });
  const [dimensions, setDimensions] = useState<{
    length: number;
    width: number;
    height: number;
    units: "CM" | "IN";
  }>({
    length: 0,
    width: 0,
    height: 0,
    units: "CM",
  });

  // Step 4: Rates
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  // Step 5: Confirm
  const [showBypassDialog, setShowBypassDialog] = useState(false);
  const [bypassReference, setBypassReference] = useState("");
  const [bypassNotes, setBypassNotes] = useState("");

  /**
   * Estimate the rates came from. Passing it to the proxy endpoint links the
   * shipment to its quote, which is what lets the dashboard show a real source
   * estimate instead of guessing at one by matching cities and dates.
   */
  const [estimateId, setEstimateId] = useState<string | null>(null);

  // Data hooks
  const { data: userData } = useUsers({
    page: 1,
    limit: 20,
    search: debouncedUserSearch || undefined,
  });

  const { data: preselectedUserData } = useUsers({
    search: preselectedUserCode || "",
    limit: 1,
  });
  const preselectedUser =
    preselectedUserData?.users.find(
      (u) => u.userCode === preselectedUserCode,
    ) || null;

  const {
    mutate: getQuote,
    data: quoteData,
    isPending: estimatesPending,
    error: estimatesError,
  } = useShippingQuote();

  const { mutate: createShipment, isPending: createPending } =
    useCreateProxyShipment();
  const { mutate: bypassPayment, isPending: bypassPending } =
    useBypassPayment();

  // Auto-select user from URL param
  useEffect(() => {
    if (preselectedUser && !selectedUser) {
      setSelectedUser(preselectedUser);
      setStep(2);
    }
  }, [preselectedUser, selectedUser]);

  /** Fetch live carrier rates for the entered route. */
  const handleGetRates = () => {
    getQuote(
      {
        pickup: toCarrierAddress(pickup),
        dropoff: toCarrierAddress(dropoff),
        packages: [{ weight, dimensions }],
      },
      {
        onSuccess: (data) => {
          setEstimateId(data.estimateId ?? null);
          setSelectedRate(null);
          setStep(4);
        },
      },
    );
  };

  /**
   * Creates the shipment on the selected user's behalf.
   *
   * When `bypass` is set, the shipment is created first and then marked paid —
   * the bypass endpoint is shipment-scoped, so it cannot run until an id
   * exists. A failed bypass leaves a valid unpaid shipment rather than rolling
   * back, so the admin is told exactly which half succeeded.
   *
   * @param bypass - Whether to mark the new shipment as paid immediately.
   */
  const handleCreate = (bypass: boolean) => {
    if (!selectedUser || !selectedRate) return;

    createShipment(
      {
        targetUserId: selectedUser.id,
        carrierSlug: selectedRate.carrierSlug,
        pickupAddress: toCarrierAddress(pickup),
        dropoffAddress: toCarrierAddress(dropoff),
        packages: [{ weight, dimensions }],
        rate: {
          serviceType: selectedRate.serviceType,
          serviceName: selectedRate.serviceName,
          carrierPrice: selectedRate.carrierPrice,
          actualPrice: selectedRate.actualPrice,
          // Commission is calculated against this currency server-side and
          // defaults to PLN, so a EUR rate sent without it books at roughly
          // a quarter of its price.
          currency: selectedRate.currency,
        },
        ...(estimateId ? { estimateId } : {}),
      },
      {
        onSuccess: (created) => {
          if (!bypass) {
            router.push("/dashboard/shipments");
            return;
          }

          if (!created?.id) {
            toast.error(
              "Shipment created, but no id came back — mark it paid from the shipments list.",
            );
            router.push("/dashboard/shipments");
            return;
          }

          bypassPayment(
            {
              shipmentId: created.id,
              data: {
                manualTransactionId: bypassReference.trim(),
                notes: bypassNotes.trim() || undefined,
              },
            },
            { onSettled: () => router.push("/dashboard/shipments") },
          );
        },
      },
    );
  };

  /** Validate current step before proceeding. */
  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return !!selectedUser;
      case 2:
        return (
          pickup.street1 &&
          pickup.city &&
          pickup.state &&
          pickup.postalCode &&
          pickup.countryCode &&
          dropoff.street1 &&
          dropoff.city &&
          dropoff.state &&
          dropoff.postalCode &&
          dropoff.countryCode
        );
      case 3:
        return (
          weight.value > 0 &&
          dimensions.length > 0 &&
          dimensions.width > 0 &&
          dimensions.height > 0
        );
      case 4:
        return !!selectedRate;
      default:
        return true;
    }
  }, [step, selectedUser, pickup, dropoff, weight, dimensions, selectedRate]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/shipments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create Shipment</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === s.id
                  ? "bg-brand-blue text-white"
                  : step > s.id
                    ? "bg-brand-blue/10 text-brand-blue"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 h-px mx-1 ${
                  step > s.id ? "bg-brand-blue" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select User */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select User</CardTitle>
            <CardDescription>
              Search by name, email, or user code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userData?.users.map((user: User) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedUser?.id === user.id
                      ? "border-brand-blue bg-brand-blue/5"
                      : "border-border hover:border-brand-blue/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    {user.userCode && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {user.userCode}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
              {userData?.users.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Addresses */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pickup Address</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressFields
                value={pickup}
                onChange={setPickup}
                prefix="pickup"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dropoff Address</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressFields
                value={dropoff}
                onChange={setDropoff}
                prefix="dropoff"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Package Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
            <CardDescription>Weight and dimensions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weight.value || ""}
                  onChange={(e) =>
                    setWeight({
                      ...weight,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Weight Unit</Label>
                <Select
                  value={weight.units}
                  onValueChange={(v) =>
                    setWeight({ ...weight, units: v as "KG" | "LB" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="LB">LB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Length</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={dimensions.length || ""}
                  onChange={(e) =>
                    setDimensions({
                      ...dimensions,
                      length: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Width</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={dimensions.width || ""}
                  onChange={(e) =>
                    setDimensions({
                      ...dimensions,
                      width: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={dimensions.height || ""}
                  onChange={(e) =>
                    setDimensions({
                      ...dimensions,
                      height: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={dimensions.units}
                  onValueChange={(v) =>
                    setDimensions({
                      ...dimensions,
                      units: v as "CM" | "IN",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CM">CM</SelectItem>
                    <SelectItem value="IN">IN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Rate Selection */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Rate</CardTitle>
            <CardDescription>
              Choose a shipping rate for this shipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {estimatesPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Fetching rates…
                </span>
              </div>
            ) : estimatesError ? (
              <div className="text-center py-8">
                <p className="text-sm text-destructive mb-4">
                  Failed to get rates. Please check the addresses and try again.
                </p>
                <Button variant="outline" onClick={() => setStep(2)}>
                  Edit Addresses
                </Button>
              </div>
            ) : quoteData?.rates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No rates available for this route.
              </p>
            ) : (
              <div className="space-y-3">
                {quoteData?.rates.map((rate, index) => (
                  <button
                    key={`${rate.carrierSlug}-${rate.serviceType}-${index}`}
                    onClick={() => setSelectedRate(rate)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedRate?.serviceType === rate.serviceType &&
                      selectedRate?.carrierSlug === rate.carrierSlug
                        ? "border-brand-blue bg-brand-blue/5"
                        : "border-border hover:border-brand-blue/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">
                          {rate.serviceName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rate.carrier}
                          {rate.deliveryDescription
                            ? ` · ${rate.deliveryDescription}`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg">
                          {formatCurrency(rate.currency, rate.actualPrice)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          carrier {formatCurrency(
                            rate.currency,
                            rate.carrierPrice,
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {quoteData?.errors && quoteData.errors.length > 0 && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-3">
                    <p className="text-xs font-semibold text-amber-800">
                      {quoteData.errors.length} carrier
                      {quoteData.errors.length !== 1 ? "s" : ""} returned no
                      rates
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {quoteData.errors.map((err, i) => (
                        <li key={i} className="text-[11px] text-amber-800/80">
                          <span className="font-medium">{err.carrier}</span>:{" "}
                          {err.details}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Confirm & Create */}
      {step === 5 && selectedUser && selectedRate && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Shipment</CardTitle>
            <CardDescription>Review details before creating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  User
                </p>
                <p className="text-sm font-medium">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedUser.email}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Rate
                </p>
                <p className="text-sm font-medium">
                  {selectedRate.serviceName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedRate.carrier} ·{" "}
                  {formatCurrency(
                    selectedRate.currency,
                    selectedRate.actualPrice,
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Pickup
                </p>
                <p className="text-sm">
                  {pickup.street1}, {pickup.city}, {pickup.state}{" "}
                  {pickup.postalCode}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Dropoff
                </p>
                <p className="text-sm">
                  {dropoff.street1}, {dropoff.city}, {dropoff.state}{" "}
                  {dropoff.postalCode}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Package
                </p>
                <p className="text-sm">
                  {weight.value} {weight.units} · {dimensions.length}×
                  {dimensions.width}×{dimensions.height} {dimensions.units}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                disabled={createPending}
                onClick={() => handleCreate(false)}
              >
                {createPending ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : null}
                Create Shipment
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={createPending}
                onClick={() => setShowBypassDialog(true)}
              >
                Create & Bypass Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {step < 5 && (
          <Button
            onClick={() => {
              if (step === 3) {
                handleGetRates();
              } else {
                setStep((s) => s + 1);
              }
            }}
            disabled={!canProceed || (step === 3 && estimatesPending)}
          >
            {step === 3 ? (
              estimatesPending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Getting Rates…
                </>
              ) : (
                "Get Rates"
              )
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Bypass Payment — needs a reference, so it collects one rather than
          confirming blindly. The bypass endpoint requires a transaction id. */}
      <Dialog open={showBypassDialog} onOpenChange={setShowBypassDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create &amp; Bypass Payment</DialogTitle>
            <DialogDescription>
              Creates the shipment and immediately marks it paid without the
              user paying. Record where the money actually came from.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bypass-reference">
                Payment reference <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bypass-reference"
                value={bypassReference}
                onChange={(e) => setBypassReference(e.target.value)}
                placeholder="BANK-REF-123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bypass-notes">Notes</Label>
              <Textarea
                id="bypass-notes"
                value={bypassNotes}
                onChange={(e) => setBypassNotes(e.target.value)}
                placeholder="Reason for the bypass…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBypassDialog(false)}
              disabled={createPending || bypassPending}
            >
              Cancel
            </Button>
            <Button
              disabled={
                !bypassReference.trim() || createPending || bypassPending
              }
              onClick={() => {
                setShowBypassDialog(false);
                handleCreate(true);
              }}
            >
              {(createPending || bypassPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create &amp; Bypass
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Address Form Subcomponent ─────────────────────────────────────

interface AddressFormProps {
  value: AddressForm;
  onChange: (value: AddressForm) => void;
  prefix: string;
}

/**
 * Reusable address form for pickup and dropoff sections.
 */
function AddressFields({ value, onChange, prefix }: AddressFormProps) {
  const update = (field: keyof AddressForm, val: string | boolean) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-2">
        <Label htmlFor={`${prefix}-street1`}>Street Address</Label>
        <Input
          id={`${prefix}-street1`}
          value={value.street1}
          onChange={(e) => update("street1", e.target.value)}
          placeholder="123 Main St"
        />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor={`${prefix}-street2`}>
          Street 2 <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id={`${prefix}-street2`}
          value={value.street2}
          onChange={(e) => update("street2", e.target.value)}
          placeholder="Apt 4B"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-city`}>City</Label>
        <Input
          id={`${prefix}-city`}
          value={value.city}
          onChange={(e) => update("city", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-state`}>State / Province</Label>
        <Input
          id={`${prefix}-state`}
          value={value.state}
          onChange={(e) => update("state", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-postalCode`}>Postal Code</Label>
        <Input
          id={`${prefix}-postalCode`}
          value={value.postalCode}
          onChange={(e) => update("postalCode", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-countryCode`}>Country Code</Label>
        <Input
          id={`${prefix}-countryCode`}
          value={value.countryCode}
          onChange={(e) => update("countryCode", e.target.value)}
          placeholder="PL"
          maxLength={2}
        />
      </div>
      <div className="col-span-2 flex items-start gap-3 rounded-lg border p-3">
        <Checkbox
          id={`${prefix}-residential`}
          checked={value.residential}
          onChange={(e) => update("residential", e.target.checked)}
          className="mt-0.5"
        />
        <div className="space-y-0.5">
          <Label
            htmlFor={`${prefix}-residential`}
            className="cursor-pointer text-sm font-medium"
          >
            Residential address
          </Label>
          <p className="text-xs text-muted-foreground">
            Carriers price residential delivery differently — getting this
            wrong changes the quote.
          </p>
        </div>
      </div>
    </div>
  );
}
