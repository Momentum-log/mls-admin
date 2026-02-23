import {
  Commission,
  CommissionType,
  CommissionCurrency,
  UpdateCommissionsPayload,
} from "@/types/carriers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Truck, MapPin, ArrowRightLeft } from "lucide-react";

interface CommissionEditorProps {
  commissions: UpdateCommissionsPayload;
  onChange: (commissions: UpdateCommissionsPayload) => void;
}

export default function CommissionEditor({
  commissions,
  onChange,
}: CommissionEditorProps) {
  const handleUpdate = (
    stage: keyof UpdateCommissionsPayload,
    field: keyof Commission,
    value: any,
  ) => {
    const stageConfig = { ...commissions[stage] };

    if (field === "type") {
      stageConfig.type = value as CommissionType;
      // If switching to PERCENT, currency is irrelevant (but cleared for cleanliness)
      if (value === "PERCENT") delete stageConfig.currency;
      // If switching to FIXED, default currency based on stage rules
      if (value === "FIXED" && !stageConfig.currency) {
        stageConfig.currency = stage === "local" ? "PLN" : "EUR";
      }
    } else if (field === "value") {
      // Keep string if ending with decimal, otherwise parse
      stageConfig.value = value === "" ? 0 : parseFloat(value) || 0;
    } else if (field === "currency") {
      stageConfig.currency = value as CommissionCurrency;
    }

    onChange({ ...commissions, [stage]: stageConfig });
  };

  const stages = [
    {
      key: "local",
      title: "Local (PL → PL)",
      icon: MapPin,
      color: "text-brand-blue",
      allowedCurrencies: ["PLN", "EUR"],
    },
    {
      key: "export",
      title: "Export (PL → World)",
      icon: ArrowRightLeft,
      color: "text-brand-yellow",
      allowedCurrencies: ["EUR"],
    },
    {
      key: "import",
      title: "Import (World → PL)",
      icon: Truck,
      color: "text-green-600",
      allowedCurrencies: ["EUR"],
    },
    {
      key: "international",
      title: "International",
      icon: Globe,
      color: "text-purple-600",
      allowedCurrencies: ["EUR"],
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {stages.map((stage) => {
          const config = commissions[stage.key];
          const isFixed = config.type === "FIXED";

          return (
            <Card key={stage.key} className="border-l-4 border-l-brand-blue/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <stage.icon className={`h-4 w-4 ${stage.color}`} />
                  {stage.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Type
                    </Label>
                    <Select
                      value={config.type}
                      onValueChange={(val) =>
                        handleUpdate(stage.key, "type", val)
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                        <SelectItem value="FIXED">Flat Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Value
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        className="h-8 pr-8"
                        value={config.value}
                        onChange={(e) =>
                          handleUpdate(stage.key, "value", e.target.value)
                        }
                      />
                      {config.type === "PERCENT" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                          %
                        </span>
                      )}
                    </div>
                  </div>

                  {isFixed && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                      <Label className="text-xs text-muted-foreground">
                        Currency
                      </Label>
                      <Select
                        value={config.currency || "EUR"}
                        onValueChange={(val) =>
                          handleUpdate(stage.key, "currency", val)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stage.allowedCurrencies.map((curr) => (
                            <SelectItem key={curr} value={curr}>
                              {curr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
