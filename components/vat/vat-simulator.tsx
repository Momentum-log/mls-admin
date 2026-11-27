"use client";

import { useState } from "react";
import { useSimulateVat } from "@/hooks/admin/use-vat";
import { CLIENT_TYPES, CLIENT_TYPE_LABEL, ROUTE_LABEL, type ClientType } from "@/types/vat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

/**
 * "Why did this get 0%?" in ten seconds: pick a journey and a client type and
 * see the VAT the live matrix gives, next to the built-in defaults.
 */
export function VatSimulator() {
  const [pickup, setPickup] = useState("PL");
  const [delivery, setDelivery] = useState("DE");
  const [clientType, setClientType] = useState<ClientType>("PL_B2B");
  const { mutate, data, isPending } = useSimulateVat();

  const valid = pickup.trim().length === 2 && delivery.trim().length === 2;

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div>
        <h3 className="text-base font-semibold">VAT simulator</h3>
        <p className="text-sm text-muted-foreground">
          Check what VAT a journey gets under the live matrix. Nothing is saved.
        </p>
      </div>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          mutate({
            pickupCountry: pickup.trim().toUpperCase(),
            deliveryCountry: delivery.trim().toUpperCase(),
            clientType,
          });
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="sim-from">From (country code)</Label>
          <Input id="sim-from" className="w-24 uppercase" maxLength={2} value={pickup} onChange={(e) => setPickup(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sim-to">To (country code)</Label>
          <Input id="sim-to" className="w-24 uppercase" maxLength={2} value={delivery} onChange={(e) => setDelivery(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Client</Label>
          <Select value={clientType} onValueChange={(v) => setClientType(v as ClientType)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_TYPES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CLIENT_TYPE_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={!valid || isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Check
        </Button>
      </form>

      {data && (
        <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
          <p>
            Route <strong>{data.decision.routeType}</strong> ({ROUTE_LABEL[data.decision.routeType]}) ·
            live matrix version {data.matrixVersion}
          </p>
          <p className="flex flex-wrap items-center gap-2">
            VAT code <Badge>{data.decision.vatCode}</Badge>
            <span>({data.decision.vatRatePercent}%)</span>
            {data.decision.needsReview && <Badge variant="outline">Needs review</Badge>}
          </p>
          <p className={data.differsFromSeed ? "font-medium text-destructive" : "text-muted-foreground"}>
            {data.differsFromSeed
              ? `The built-in defaults would give ${data.seed.vatCode} (${data.seed.vatRatePercent}%). A cell was edited.`
              : "Same as the built-in defaults."}
          </p>
          {data.decision.noteEn && <p className="text-muted-foreground">{data.decision.noteEn}</p>}
        </div>
      )}
    </div>
  );
}
