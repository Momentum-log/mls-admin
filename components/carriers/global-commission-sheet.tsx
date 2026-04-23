import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, ShieldAlert } from "lucide-react";
import { GlobalCommissionSettings } from "@/types/settings";
import {
  useGlobalCommissionSettings,
  useUpdateGlobalCommissionSettings,
} from "@/hooks/settings/use-settings";
import { Card, CardContent } from "@/components/ui/card";

interface GlobalCommissionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GlobalCommissionSheet({
  open,
  onOpenChange,
}: GlobalCommissionSheetProps) {
  const { data: serverSettings, isLoading: isFetching } =
    useGlobalCommissionSettings();
  const { mutateAsync: updateAsync, isPending: isUpdating } =
    useUpdateGlobalCommissionSettings();

  const [settings, setSettings] = useState<Partial<GlobalCommissionSettings>>({
    minRateThresholdPln: null,
    minFlatCommissionPln: null,
    isEurManual: false,
    minRateThresholdEur: null,
    minFlatCommissionEur: null,
  });

  useEffect(() => {
    if (serverSettings) {
      setSettings(serverSettings as Partial<GlobalCommissionSettings>);
    }
  }, [serverSettings, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAsync(settings);
      onOpenChange(false);
    } catch (error) {
      // toast native to hook
    }
  };

  const handleUpdate = (field: keyof GlobalCommissionSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value === "" ? null : value }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-brand-blue" />
            Global Safety Net
          </SheetTitle>
          <SheetDescription>
            Universal fallback thresholds. These apply if a carrier has no
            active overriding rules.
          </SheetDescription>
        </SheetHeader>

        {isFetching ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="px-6 pb-6 pt-6 flex-1 flex flex-col space-y-6"
          >
            <Card className="border-none shadow-none">
              <CardContent className="space-y-4 p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Min Rate Threshold (PLN)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      className="h-9"
                      value={settings.minRateThresholdPln ?? ""}
                      onChange={(e) =>
                        handleUpdate("minRateThresholdPln", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Flat Commission (PLN)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      className="h-9"
                      value={settings.minFlatCommissionPln ?? ""}
                      onChange={(e) =>
                        handleUpdate("minFlatCommissionPln", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 mt-4 bg-muted/10">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Manual EUR Override
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Disable auto-conversion to EUR
                    </p>
                  </div>
                  <Switch
                    checked={settings.isEurManual || false}
                    onCheckedChange={(checked) =>
                      handleUpdate("isEurManual", checked)
                    }
                  />
                </div>

                {settings.isEurManual && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Min Rate Threshold (EUR)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        className="h-9"
                        value={settings.minRateThresholdEur ?? ""}
                        onChange={(e) =>
                          handleUpdate("minRateThresholdEur", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Flat Commission (EUR)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        className="h-9"
                        value={settings.minFlatCommissionEur ?? ""}
                        onChange={(e) =>
                          handleUpdate("minFlatCommissionEur", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="pt-6 mt-auto shrink-0 border-t flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-brand-blue hover:bg-brand-blue/90"
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Global Rules
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
