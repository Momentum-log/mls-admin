import { CarrierCommissionSettings } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  Truck,
  MapPin,
  ArrowRightLeft,
  ShieldAlert,
} from "lucide-react";

interface ThresholdEditorProps {
  settings: Partial<CarrierCommissionSettings>;
  onChange: (settings: Partial<CarrierCommissionSettings>) => void;
}

export default function ThresholdEditor({
  settings,
  onChange,
}: ThresholdEditorProps) {
  const handleUpdate = (field: keyof CarrierCommissionSettings, value: any) => {
    onChange({ ...settings, [field]: value === "" ? null : value });
  };

  const stages = [
    {
      key: "local",
      title: "Local (PL → PL)",
      icon: MapPin,
      prefix: "local",
    },
    {
      key: "export",
      title: "Export (PL → World)",
      icon: ArrowRightLeft,
      prefix: "export",
    },
    {
      key: "import",
      title: "Import (World → PL)",
      icon: Truck,
      prefix: "import",
    },
    {
      key: "international",
      title: "International",
      icon: Globe,
      prefix: "international",
    },
  ];

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="h-5 w-5 text-brand-blue" />
        <h3 className="font-semibold text-lg">
          Minimum Thresholds (Safety Net)
        </h3>
      </div>

      {/* Carrier Fallback */}
      <Card className="border-l-4 border-l-gray-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Carrier Fallback</CardTitle>
          <p className="text-xs text-muted-foreground">
            Applies if no route-specific threshold is set.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Min Rate Threshold (PLN)
              </Label>
              <Input
                type="number"
                min="0"
                step="any"
                className="h-8"
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
                className="h-8"
                value={settings.minFlatCommissionPln ?? ""}
                onChange={(e) =>
                  handleUpdate("minFlatCommissionPln", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 mt-2 bg-muted/10">
            <div className="space-y-0.5">
              <Label className="text-xs">Manual EUR Override</Label>
              <p className="text-[10px] text-muted-foreground">
                Disable auto-conversion to set manual EUR values.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Min Rate Threshold (EUR)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  className="h-8"
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
                  className="h-8"
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

      {/* Route-Specific Minimums */}
      {stages.map((stage) => {
        const pre = stage.prefix;
        const ratePln = `${pre}MinRatePln` as keyof CarrierCommissionSettings;
        const flatPln = `${pre}MinFlatPln` as keyof CarrierCommissionSettings;
        const rateEur = `${pre}MinRateEur` as keyof CarrierCommissionSettings;
        const flatEur = `${pre}MinFlatEur` as keyof CarrierCommissionSettings;
        const isMan =
          `is${pre.charAt(0).toUpperCase() + pre.slice(1)}EurManual` as keyof CarrierCommissionSettings;

        return (
          <Card key={stage.key} className="border-l-4 border-l-brand-blue/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <stage.icon className="h-4 w-4 text-brand-blue" />
                {stage.title} Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Min Rate (PLN)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    className="h-8"
                    value={(settings[ratePln] as number) ?? ""}
                    onChange={(e) => handleUpdate(ratePln, e.target.value)}
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
                    className="h-8"
                    value={(settings[flatPln] as number) ?? ""}
                    onChange={(e) => handleUpdate(flatPln, e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 mt-2 bg-muted/10">
                <div className="space-y-0.5">
                  <Label className="text-xs">Manual EUR Override</Label>
                </div>
                <Switch
                  checked={(settings[isMan] as boolean) || false}
                  onCheckedChange={(checked) => handleUpdate(isMan, checked)}
                />
              </div>
              {settings[isMan] && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Min Rate (EUR)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      className="h-8"
                      value={(settings[rateEur] as number) ?? ""}
                      onChange={(e) => handleUpdate(rateEur, e.target.value)}
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
                      className="h-8"
                      value={(settings[flatEur] as number) ?? ""}
                      onChange={(e) => handleUpdate(flatEur, e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
