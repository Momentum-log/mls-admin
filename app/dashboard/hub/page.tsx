"use client";

import { useState } from "react";
import {
  useHubConfig,
  useSetHubRouting,
  useSetCompeteBestPrice,
} from "@/hooks/admin/use-hub";
import type { SortingCenter } from "@/types/hub";
import SortingCenterSheet from "@/components/hub/sorting-center-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Route,
  Building2,
  AlertTriangle,
  ServerCog,
} from "lucide-react";
import { formatDateTime } from "@/utils/format-date";

/**
 * Hub routing configuration.
 *
 * Two switches that nest: hub routing is the master, compete-best-price only
 * means anything while the master is on. Rather than restate that logic here,
 * the page renders the server's own `routingMode` sentence — one source of
 * truth for what the current combination actually does.
 */
export default function HubPage() {
  const { data: config, isLoading } = useHubConfig();
  const { mutate: setRouting, isPending: routingPending } = useSetHubRouting();
  const { mutate: setCompete, isPending: competePending } =
    useSetCompeteBestPrice();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<SortingCenter | null>(
    null,
  );

  const openCreate = () => {
    setSelectedCenter(null);
    setSheetOpen(true);
  };

  const openEdit = (center: SortingCenter) => {
    setSelectedCenter(center);
    setSheetOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const centers = config?.sortingCenters ?? [];
  const usingEnvFallback = config?.activeHub?.source === "environment";
  const noCentreConfigured = !config?.configured;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hub &amp; Routing</h2>
          <p className="text-muted-foreground">
            Route international shipments through the sorting centre.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-brand-blue hover:bg-brand-blue/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Centre
        </Button>
      </div>

      {/* Blocking warning — routing on with nothing to route through. */}
      {config?.hubRoutingEnabled && noCentreConfigured && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">
              Hub routing is on, but no sorting centre is configured.
            </p>
            <p className="text-sm text-destructive/80 mt-0.5">
              Quotes stay direct-only until a centre is created and activated.
            </p>
          </div>
        </div>
      )}

      {usingEnvFallback && (
        <div className="rounded-md border border-amber-500/50 bg-amber-50 p-4 flex items-start gap-3">
          <ServerCog className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              Using the environment fallback centre.
            </p>
            <p className="text-sm text-amber-800/80 mt-0.5">
              This address comes from deploy-time configuration, not the
              database. Activating any centre below replaces it.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Routing switches */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="h-5 w-5 text-brand-blue" />
              Routing Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg bg-brand-blue/5 border border-brand-blue/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-1">
                Currently
              </p>
              <p className="text-sm font-medium text-foreground">
                {config?.routingMode}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5 pr-4">
                <Label className="text-base">Hub routing</Label>
                <p className="text-xs text-muted-foreground">
                  Master switch. Off means every quote is direct.
                </p>
              </div>
              <Switch
                checked={config?.hubRoutingEnabled ?? false}
                disabled={routingPending}
                onCheckedChange={(checked) => setRouting(checked)}
              />
            </div>

            <div
              className={
                config?.hubRoutingEnabled
                  ? "flex items-center justify-between rounded-lg border p-4"
                  : "flex items-center justify-between rounded-lg border p-4 opacity-60"
              }
            >
              <div className="space-y-0.5 pr-4">
                <Label className="text-base">Compete on best price</Label>
                <p className="text-xs text-muted-foreground">
                  {config?.hubRoutingEnabled
                    ? "On, hub and direct rates compete and the better option wins each tier. Off, every tier routes through the centre."
                    : "Has no effect while hub routing is off."}
                </p>
              </div>
              <Switch
                checked={config?.competeBestPrice ?? false}
                disabled={competePending || !config?.hubRoutingEnabled}
                onCheckedChange={(checked) => setCompete(checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active hub */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-brand-blue" />
              Active Centre
            </CardTitle>
          </CardHeader>
          <CardContent>
            {config?.activeHub ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-bold">{config.activeHub.name}</p>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    {config.activeHub.code}
                  </code>
                </div>
                <div className="text-muted-foreground">
                  {config.activeHub.address.streetLines?.join(", ")}
                  <br />
                  {config.activeHub.address.city}{" "}
                  {config.activeHub.address.postalCode}
                  <br />
                  {config.activeHub.address.countryCode}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Dwell</span>
                  <span className="font-medium">
                    {config.activeHub.dwellDays} day
                    {config.activeHub.dwellDays !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <Badge
                    variant={
                      config.activeHub.source === "database"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {config.activeHub.source}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto opacity-20 mb-2" />
                <p className="text-sm">No centre configured.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sorting centres */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Dwell</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {centers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Building2 className="h-8 w-8 opacity-20" />
                    <p>No sorting centres yet.</p>
                    <Button variant="link" onClick={openCreate}>
                      Add your first centre
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              centers.map((center) => (
                <TableRow
                  key={center.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openEdit(center)}
                >
                  <TableCell>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                      {center.code}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium">{center.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {center.city}, {center.countryCode}
                  </TableCell>
                  <TableCell className="text-sm">
                    {center.contactName}
                    <span className="block text-xs text-muted-foreground">
                      {center.contactPhone}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {center.dwellDays}d
                  </TableCell>
                  <TableCell>
                    {center.isActive ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Standby</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(center.updatedAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SortingCenterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        center={selectedCenter}
      />
    </div>
  );
}
