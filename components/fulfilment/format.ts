import type { HandoverPreference, QueueAddress, QueuePackage } from "@/types/fulfilment";

export function addressLines(a: QueueAddress | null | undefined): string[] {
  if (!a) return [];
  return [
    a.contact?.companyName,
    a.contact?.personName,
    ...(a.streetLines ?? []),
    [a.postalCode, a.city].filter(Boolean).join(" "),
    [a.stateOrProvinceCode, a.countryCode].filter(Boolean).join(" "),
  ].filter((line): line is string => Boolean(line && line.trim()));
}

export function packageLine(p: QueuePackage, index: number): string {
  const weight = p.weight ? `${p.weight.value} ${p.weight.units ?? "KG"}` : "weight ?";
  const dims = p.dimensions
    ? `${p.dimensions.length} x ${p.dimensions.width} x ${p.dimensions.height} ${p.dimensions.units ?? "CM"}`
    : "no dimensions";
  return `#${index + 1}: ${weight}, ${dims}`;
}

export function handoverText(h: HandoverPreference | null): string {
  if (!h) return "Not chosen. Ask the customer, or book a drop-off.";
  if (h.method === "DROPOFF") return "Customer will drop the parcel off";
  return `Courier pickup on ${h.pickupDate}, ready ${h.readyTime} to ${h.closeTime}`;
}

export function waitingText(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} days`;
}

/** Reads a File as bare base64 (no data: prefix). */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}
