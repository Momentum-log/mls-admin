import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, Globe } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CARRIER_SLUGS } from "@/lib/api/carriers/constants";
import CommissionEditor from "./commission-editor";
import ThresholdEditor from "./threshold-editor";
import {
  Carrier,
  CreateCarrierPayload,
  UpdateCarrierPayload,
  UpdateCommissionsPayload,
} from "@/types/carriers";
import {
  useCreateCarrier,
  useUpdateCarrier,
  useDeleteCarrier,
  useUpdateCommissions,
} from "@/hooks/carriers/use-carriers";
import {
  useCarrierCommissionSettings,
  useUpdateCarrierCommissionSettings,
} from "@/hooks/settings/use-settings";
import { CarrierCommissionSettings } from "@/types/settings";

interface CarrierDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrier: Carrier | null; // null = Create Mode, object = Edit Mode
}

const defaultCommissions: UpdateCommissionsPayload = {
  local: { type: "PERCENT", value: 0 },
  export: { type: "PERCENT", value: 0 },
  import: { type: "PERCENT", value: 0 },
  international: { type: "PERCENT", value: 0 },
};

const defaultSettings: Partial<CarrierCommissionSettings> = {
  minRateThresholdPln: null,
  minFlatCommissionPln: null,
  isEurManual: false,
  minRateThresholdEur: null,
  minFlatCommissionEur: null,
  localMinRatePln: null,
  localMinFlatPln: null,
  isLocalEurManual: false,
  localMinRateEur: null,
  localMinFlatEur: null,
  exportMinRatePln: null,
  exportMinFlatPln: null,
  isExportEurManual: false,
  exportMinRateEur: null,
  exportMinFlatEur: null,
  importMinRatePln: null,
  importMinFlatPln: null,
  isImportEurManual: false,
  importMinRateEur: null,
  importMinFlatEur: null,
  internationalMinRatePln: null,
  internationalMinFlatPln: null,
  isInternationalEurManual: false,
  internationalMinRateEur: null,
  internationalMinFlatEur: null,
};

export default function CarrierDetailSheet({
  open,
  onOpenChange,
  carrier,
}: CarrierDetailSheetProps) {
  const isEditMode = !!carrier;

  const { mutateAsync: createAsync, isPending: isCreating } =
    useCreateCarrier();
  const { mutateAsync: updateAsync, isPending: isUpdating } =
    useUpdateCarrier();
  const { mutateAsync: updateCommsAsync, isPending: isUpdatingComms } =
    useUpdateCommissions();
  const { mutateAsync: updateSettingsAsync, isPending: isUpdatingSettings } =
    useUpdateCarrierCommissionSettings();
  const { mutate: remove, isPending: isDeleting } = useDeleteCarrier();

  const { data: serverSettings, isLoading: isFetchingSettings } =
    useCarrierCommissionSettings(isEditMode ? carrier.id : null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomSlug, setIsCustomSlug] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<CreateCarrierPayload>>({
    name: "",
    slug: "",
    baseUrl: "",
    apiKey: "",
    apiSecret: "",
    isActive: true,
  });

  const [commissions, setCommissions] =
    useState<UpdateCommissionsPayload>(defaultCommissions);

  const [settings, setSettings] =
    useState<Partial<CarrierCommissionSettings>>(defaultSettings);

  // Load carrier data when opening in edit mode
  useEffect(() => {
    if (carrier) {
      setFormData({
        name: carrier.name,
        slug: carrier.slug || "",
        baseUrl: carrier.baseUrl || "",
        apiKey: "",
        apiSecret: "",
        isActive: carrier.isActive,
      });
      setIsCustomSlug(
        !!carrier.slug && !CARRIER_SLUGS.some((s) => s.id === carrier.slug),
      );
      setCommissions({
        local: carrier.localCommission || { type: "PERCENT", value: 0 },
        export: carrier.exportCommission || { type: "PERCENT", value: 0 },
        import: carrier.importCommission || { type: "PERCENT", value: 0 },
        international: carrier.internationalCommission || {
          type: "PERCENT",
          value: 0,
        },
      });
      if (serverSettings) {
        setSettings(serverSettings as Partial<CarrierCommissionSettings>);
      }
    } else {
      setFormData({
        name: "",
        slug: "",
        baseUrl: "",
        apiKey: "",
        apiSecret: "",
        isActive: true,
      });
      setIsCustomSlug(false);
      setCommissions(defaultCommissions);
      setSettings(defaultSettings);
    }
  }, [carrier, open, serverSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditMode && carrier) {
        const payload: UpdateCarrierPayload = {
          name: formData.name,
          slug: formData.slug,
          baseUrl: formData.baseUrl || undefined,
          isActive: formData.isActive,
        };
        // Only include secrets if they were changed (non-empty)
        if (formData.apiKey) payload.apiKey = formData.apiKey;
        if (formData.apiSecret) payload.apiSecret = formData.apiSecret;

        await updateAsync({ id: carrier.id, data: payload });
        await updateCommsAsync({ id: carrier.id, data: commissions });
        await updateSettingsAsync({ carrierId: carrier.id, payload: settings });
      } else {
        const payload: CreateCarrierPayload = {
          name: formData.name as string,
          slug: formData.slug as string,
          baseUrl: formData.baseUrl || undefined,
          apiKey: formData.apiKey || undefined,
          apiSecret: formData.apiSecret || undefined,
          isActive: formData.isActive,
        };

        const newCarrier = await createAsync(payload);
        if (newCarrier?.id) {
          await updateCommsAsync({ id: newCarrier.id, data: commissions });
          await updateSettingsAsync({
            carrierId: newCarrier.id,
            payload: settings,
          });
        }
      }
      onOpenChange(false);
    } catch (error) {
      // Errors are handled by the hooks toasts natively
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (force: boolean) => {
    if (carrier) {
      remove(carrier.id);
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    }
  };

  const isLoading =
    isCreating ||
    isUpdating ||
    isDeleting ||
    isUpdatingComms ||
    isUpdatingSettings ||
    isSubmitting;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <SheetTitle>
              {isEditMode ? `Edit ${carrier.name}` : "Add New Carrier"}
            </SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Manage carrier integration details and commissions."
                : "Configure a new shipping provider integration."}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="px-6 pb-6 pt-4 flex-1 flex flex-col"
          >
            <Tabs defaultValue="details" className="flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Integration Details</TabsTrigger>
                <TabsTrigger value="commissions">Commissions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Carrier Name *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. FedEx"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Programmatic Slug *</Label>
                  <Select
                    value={
                      isCustomSlug
                        ? "other"
                        : CARRIER_SLUGS.some((s) => s.id === formData.slug)
                          ? formData.slug
                          : ""
                    }
                    onValueChange={(value) => {
                      if (value === "other") {
                        setIsCustomSlug(true);
                        setFormData({ ...formData, slug: "" });
                      } else {
                        setIsCustomSlug(false);
                        setFormData({ ...formData, slug: value });
                      }
                    }}
                  >
                    <SelectTrigger id="slug">
                      <SelectValue placeholder="Select a carrier adapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARRIER_SLUGS.map((slug) => (
                        <SelectItem key={slug.id} value={slug.id}>
                          {slug.name}
                        </SelectItem>
                      ))}
                      <SelectItem
                        value="other"
                        className="text-brand-blue font-medium"
                      >
                        Other / Custom...
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {isCustomSlug && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                      <Label
                        htmlFor="custom-slug"
                        className="text-xs text-muted-foreground uppercase font-semibold"
                      >
                        Custom Slug Name
                      </Label>
                      <Input
                        id="custom-slug"
                        placeholder="e.g. ups, dpd"
                        className="mt-1"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "-"),
                          })
                        }
                      />
                      {formData.slug &&
                        formData.name &&
                        !formData.slug.includes(
                          formData.name.toLowerCase().replace(/\s+/g, "-"),
                        ) && (
                          <p className="text-[0.8rem] text-destructive mt-1">
                            Slug must include the carrier name (
                            {formData.name.toLowerCase().replace(/\s+/g, "-")})
                          </p>
                        )}
                    </div>
                  )}

                  <p className="text-[0.8rem] text-muted-foreground">
                    Crucial: This maps the carrier to its backend integration
                    adapter.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://api.fedex.com"
                    value={formData.baseUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, baseUrl: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder={isEditMode ? "Unchanged" : "Optional"}
                      value={formData.apiKey}
                      onChange={(e) =>
                        setFormData({ ...formData, apiKey: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiSecret">API Secret</Label>
                    <Input
                      id="apiSecret"
                      type="password"
                      placeholder={isEditMode ? "Unchanged" : "Optional"}
                      value={formData.apiSecret}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apiSecret: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 mt-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Active Status</Label>
                    <SheetDescription>
                      Enable or disable this carrier integration.
                    </SheetDescription>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="commissions" className="pt-4 pb-12">
                <CommissionEditor
                  commissions={commissions}
                  onChange={setCommissions}
                />

                <hr className="my-8 border-t border-border/40" />

                <ThresholdEditor settings={settings} onChange={setSettings} />
              </TabsContent>
            </Tabs>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-6 mt-auto shrink-0 border-t">
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto sm:mr-auto"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.name ||
                  !formData.slug ||
                  (isCustomSlug &&
                    !formData.slug.includes(
                      formData.name.toLowerCase().replace(/\s+/g, "-"),
                    ))
                }
                className="w-full sm:w-auto min-w-[130px]"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && (isEditMode ? "Save Changes" : "Create Carrier")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={`Delete ${carrier?.name}?`}
        description="This action cannot be undone. If the carrier has active shipments, deletion will be blocked by the system."
        confirmLabel="Delete Carrier"
        destructive
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
