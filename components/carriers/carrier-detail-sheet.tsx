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
import { Loader2, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import CommissionEditor from "./commission-editor";
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
  const { mutate: remove, isPending: isDeleting } = useDeleteCarrier();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<CreateCarrierPayload>>({
    name: "",
    baseUrl: "",
    apiKey: "",
    apiSecret: "",
    isActive: true,
  });

  const [commissions, setCommissions] =
    useState<UpdateCommissionsPayload>(defaultCommissions);

  // Load carrier data when opening in edit mode
  useEffect(() => {
    if (carrier) {
      setFormData({
        name: carrier.name,
        baseUrl: carrier.baseUrl || "",
        apiKey: "", // Don't pre-fill sensitive data (it's masked anyway)
        apiSecret: "",
        isActive: carrier.isActive,
      });
      setCommissions({
        local: carrier.localCommission || { type: "PERCENT", value: 0 },
        export: carrier.exportCommission || { type: "PERCENT", value: 0 },
        import: carrier.importCommission || { type: "PERCENT", value: 0 },
        international: carrier.internationalCommission || {
          type: "PERCENT",
          value: 0,
        },
      });
    } else {
      setFormData({
        name: "",
        baseUrl: "",
        apiKey: "",
        apiSecret: "",
        isActive: true,
      });
      setCommissions(defaultCommissions);
    }
  }, [carrier, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditMode && carrier) {
        const payload: UpdateCarrierPayload = {
          name: formData.name,
          baseUrl: formData.baseUrl || undefined,
          isActive: formData.isActive,
        };
        // Only include secrets if they were changed (non-empty)
        if (formData.apiKey) payload.apiKey = formData.apiKey;
        if (formData.apiSecret) payload.apiSecret = formData.apiSecret;

        await updateAsync({ id: carrier.id, data: payload });
        await updateCommsAsync({ id: carrier.id, data: commissions });
      } else {
        const payload: CreateCarrierPayload = {
          name: formData.name as string,
          baseUrl: formData.baseUrl || undefined,
          apiKey: formData.apiKey || undefined,
          apiSecret: formData.apiSecret || undefined,
          isActive: formData.isActive,
        };

        const newCarrier = await createAsync(payload);
        if (newCarrier?.id) {
          await updateCommsAsync({ id: newCarrier.id, data: commissions });
        }
      }
      onOpenChange(false);
    } catch (error) {
      // Errors are handled by the hooks toasts natively
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (carrier) {
      remove(carrier.id);
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    }
  };

  const isLoading =
    isCreating || isUpdating || isDeleting || isUpdatingComms || isSubmitting;

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
                disabled={isLoading || !formData.name}
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
      />
    </>
  );
}
