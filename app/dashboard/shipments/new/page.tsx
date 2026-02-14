"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUsers, useUserByCode } from "@/hooks/users/use-users";
import { useShippingEstimates } from "@/hooks/shipping/use-shipping";
import { useCreateProxyShipment } from "@/hooks/shipments/use-shipments";
import { useDebounce } from "@/hooks/use-debounce";
import { User } from "@/types/user";
import { ShippingRate } from "@/types/shipping-estimate";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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

/** Steps in the shipment creation flow. */
const STEPS = [
  { id: 1, label: "Select User", icon: UserIcon },
  { id: 2, label: "Addresses", icon: MapPin },
  { id: 3, label: "Package", icon: Package },
  { id: 4, label: "Rates", icon: Truck },
  { id: 5, label: "Confirm", icon: CheckCircle },
] as const;

/** Default address state. */
const emptyAddress = {
  street1: "",
  street2: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "",
};

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
  const [createMode, setCreateMode] = useState<"normal" | "bypass">("normal");

  // Data hooks
  const { data: userData } = useUsers({
    page: 1,
    limit: 20,
    search: debouncedUserSearch || undefined,
  });

  const { data: preselectedUser } = useUserByCode(preselectedUserCode || "");

  const {
    mutate: getEstimates,
    data: estimatesData,
    isPending: estimatesPending,
    error: estimatesError,
  } = useShippingEstimates();

  const { mutate: createShipment, isPending: createPending } =
    useCreateProxyShipment();

  // Auto-select user from URL param
  useEffect(() => {
    if (preselectedUser && !selectedUser) {
      setSelectedUser(preselectedUser);
      setStep(2);
    }
  }, [preselectedUser, selectedUser]);

  /** Fetch shipping estimates from the API. */
  const handleGetRates = () => {
    getEstimates(
      {
        pickup,
        dropoff,
        package: { weight, dimensions },
      },
      {
        onSuccess: () => {
          setStep(4);
        },
      },
    );
  };

  /** Create the shipment via proxy endpoint. */
  const handleCreate = (bypass: boolean) => {
    if (!selectedUser || !selectedRate) return;

    createShipment(
      {
        targetUserId: selectedUser.id,
        carrierName: selectedRate.carrier,
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        package: { weight, dimensions },
        rate: {
          serviceType: selectedRate.serviceType,
          serviceName: selectedRate.serviceName,
          carrierPrice: selectedRate.price,
        },
      },
      {
        onSuccess: () => {
          router.push("/dashboard/shipments");
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
              <AddressForm
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
              <AddressForm
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
            ) : estimatesData?.rates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No rates available for this route.
              </p>
            ) : (
              <div className="space-y-3">
                {estimatesData?.rates.map((rate, index) => (
                  <button
                    key={`${rate.carrier}-${rate.serviceType}-${index}`}
                    onClick={() => setSelectedRate(rate)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedRate?.serviceType === rate.serviceType &&
                      selectedRate?.carrier === rate.carrier
                        ? "border-brand-blue bg-brand-blue/5"
                        : "border-border hover:border-brand-blue/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {rate.serviceName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rate.carrier} · {rate.estimatedDays} day
                          {rate.estimatedDays !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat(
                          rate.currency === "PLN" ? "pl-PL" : "en-IE",
                          {
                            style: "currency",
                            currency: rate.currency,
                          },
                        ).format(rate.price)}
                      </p>
                    </div>
                  </button>
                ))}
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
                  {new Intl.NumberFormat(
                    selectedRate.currency === "PLN" ? "pl-PL" : "en-IE",
                    {
                      style: "currency",
                      currency: selectedRate.currency,
                    },
                  ).format(selectedRate.price)}
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

      {/* Bypass Payment Confirmation */}
      <ConfirmDialog
        open={showBypassDialog}
        onOpenChange={setShowBypassDialog}
        title="Bypass Payment?"
        description="This will create the shipment and mark it as paid without requiring actual payment from the user."
        confirmLabel="Create & Bypass"
        onConfirm={() => {
          setShowBypassDialog(false);
          handleCreate(true);
        }}
      />
    </div>
  );
}

// ─── Address Form Subcomponent ─────────────────────────────────────

interface AddressFormProps {
  value: typeof emptyAddress;
  onChange: (value: typeof emptyAddress) => void;
  prefix: string;
}

/**
 * Reusable address form for pickup and dropoff sections.
 */
function AddressForm({ value, onChange, prefix }: AddressFormProps) {
  const update = (field: keyof typeof emptyAddress, val: string) => {
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
    </div>
  );
}
