"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import type { SortingCenter, CreateSortingCenterPayload } from "@/types/hub";
import {
  useCreateSortingCenter,
  useUpdateSortingCenter,
  useDeleteSortingCenter,
} from "@/hooks/admin/use-hub";

interface SortingCenterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = create mode, object = edit mode. */
  center: SortingCenter | null;
}

/** Empty form state. `dwellDays` defaults to 1, matching the server. */
const emptyForm = {
  code: "",
  name: "",
  street1: "",
  street2: "",
  street3: "",
  city: "",
  stateOrProvinceCode: "",
  postalCode: "",
  countryCode: "PL",
  contactName: "",
  contactPhone: "",
  dwellDays: 1,
  isActive: false,
};

type FormState = typeof emptyForm;

/**
 * Projects a centre onto the flat form shape, splitting `streetLines` across
 * the three inputs.
 *
 * @param center - The centre being edited, or null when creating.
 */
function centerToForm(center: SortingCenter | null): FormState {
  if (!center) return emptyForm;

  const [s1 = "", s2 = "", s3 = ""] = center.streetLines ?? [];
  return {
    code: center.code,
    name: center.name,
    street1: s1,
    street2: s2,
    street3: s3,
    city: center.city,
    stateOrProvinceCode: center.stateOrProvinceCode ?? "",
    postalCode: center.postalCode,
    countryCode: center.countryCode,
    contactName: center.contactName,
    contactPhone: center.contactPhone,
    dwellDays: center.dwellDays,
    isActive: center.isActive,
  };
}

/**
 * Create/edit sheet for a sorting centre.
 *
 * Mirrors the server's validation so an admin is told what is wrong before a
 * request goes out rather than after a 400 comes back.
 */
export default function SortingCenterSheet({
  open,
  onOpenChange,
  center,
}: SortingCenterSheetProps) {
  const isEditMode = !!center;
  const [form, setForm] = useState<FormState>(() => centerToForm(center));
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { mutate: create, isPending: isCreating } = useCreateSortingCenter();
  const { mutate: update, isPending: isUpdating } = useUpdateSortingCenter();
  const { mutate: remove, isPending: isDeleting } = useDeleteSortingCenter();

  // Reset the form when a different centre is loaded, or the sheet reopens.
  // Adjusting state during render is React's documented pattern for deriving
  // from props; doing it in an effect would render once with stale values and
  // then cascade a second render to correct them.
  const formKey = `${center?.id ?? "new"}:${open}`;
  const [lastFormKey, setLastFormKey] = useState(formKey);
  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    setForm(centerToForm(center));
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const streetLines = [form.street1, form.street2, form.street3]
    .map((l) => l.trim())
    .filter(Boolean);

  const isValid =
    form.code.trim().length > 0 &&
    form.name.trim().length > 0 &&
    streetLines.length > 0 &&
    form.city.trim().length > 0 &&
    form.postalCode.trim().length > 0 &&
    form.countryCode.trim().length === 2 &&
    form.contactName.trim().length > 0 &&
    form.contactPhone.trim().length > 0 &&
    form.dwellDays >= 0 &&
    form.dwellDays <= 30;

  const isBusy = isCreating || isUpdating || isDeleting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const payload: CreateSortingCenterPayload = {
      code: form.code.trim(),
      name: form.name.trim(),
      streetLines,
      city: form.city.trim(),
      stateOrProvinceCode: form.stateOrProvinceCode.trim() || undefined,
      postalCode: form.postalCode.trim(),
      countryCode: form.countryCode.trim().toUpperCase(),
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      dwellDays: form.dwellDays,
      isActive: form.isActive,
    };

    const onSuccess = () => onOpenChange(false);

    if (isEditMode && center) {
      update({ id: center.id, payload }, { onSuccess });
    } else {
      create(payload, { onSuccess });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <SheetTitle>
              {isEditMode ? `Edit ${center.name}` : "Add Sorting Centre"}
            </SheetTitle>
            <SheetDescription>
              The centre is the origin of leg 2 on every hub-routed shipment.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="px-6 pb-6 pt-4 flex-1 flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sc-code">Code *</Label>
                <Input
                  id="sc-code"
                  value={form.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                  placeholder="PL-LODZ"
                  maxLength={32}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sc-name">Name *</Label>
                <Input
                  id="sc-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="MLS Hub"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sc-street1">Street lines *</Label>
              <Input
                id="sc-street1"
                value={form.street1}
                onChange={(e) => set("street1", e.target.value)}
                placeholder="Pilota Żwirki 17"
              />
              <Input
                value={form.street2}
                onChange={(e) => set("street2", e.target.value)}
                placeholder="Line 2 (optional)"
              />
              <Input
                value={form.street3}
                onChange={(e) => set("street3", e.target.value)}
                placeholder="Line 3 (optional)"
              />
              <p className="text-xs text-muted-foreground">
                Up to three lines — carriers reject more.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sc-city">City *</Label>
                <Input
                  id="sc-city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Łódź"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sc-state">State / Province</Label>
                <Input
                  id="sc-state"
                  value={form.stateOrProvinceCode}
                  onChange={(e) => set("stateOrProvinceCode", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sc-postal">Postal code *</Label>
                <Input
                  id="sc-postal"
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  placeholder="90-539"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sc-country">Country code *</Label>
                <Input
                  id="sc-country"
                  value={form.countryCode}
                  onChange={(e) =>
                    set("countryCode", e.target.value.toUpperCase())
                  }
                  maxLength={2}
                  placeholder="PL"
                />
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Contact details are required. Carriers reject a leg
                  originating at the centre without a named contact and phone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sc-contact-name">Contact name *</Label>
                  <Input
                    id="sc-contact-name"
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sc-contact-phone">Contact phone *</Label>
                  <Input
                    id="sc-contact-phone"
                    value={form.contactPhone}
                    onChange={(e) => set("contactPhone", e.target.value)}
                    placeholder="+48…"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sc-dwell">Dwell days</Label>
              <Input
                id="sc-dwell"
                type="number"
                min={0}
                max={30}
                value={form.dwellDays}
                onChange={(e) =>
                  set("dwellDays", parseInt(e.target.value, 10) || 0)
                }
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                How long a parcel sits at the centre between legs. Added to
                every hub-routed transit estimate — setting it to 0 quotes a
                hub route as no slower than direct, which is never true.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Exactly one centre is active. Activating this one stands every
                  other centre down.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => set("isActive", checked)}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-4 mt-auto border-t">
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto sm:mr-auto"
                  onClick={() => setDeleteOpen(true)}
                  disabled={isBusy}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || isBusy}>
                {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Centre"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${center?.name}?`}
        description={
          center?.isActive
            ? "This centre is currently active, so the server will refuse the delete. Activate another centre, or turn hub routing off, first."
            : "This cannot be undone."
        }
        confirmLabel="Delete Centre"
        destructive
        isLoading={isDeleting}
        onConfirm={() => {
          if (!center) return;
          remove(center.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              onOpenChange(false);
            },
            onError: () => setDeleteOpen(false),
          });
        }}
      />
    </>
  );
}
