import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap } from "lucide-react";

/**
 * Props for the ConversionBadge component.
 */
interface ConversionBadgeProps {
  /** Whether the estimate was converted into a shipment. */
  converted: boolean;
}

/**
 * Displays a badge indicating whether a shipping estimate
 * was later converted into an actual shipment.
 *
 * - **Converted (true)**: Green badge with "Shipment Created"
 * - **Not converted (false)**: Purple/Accent badge with "Shipping Estimate"
 */
export default function ConversionBadge({ converted }: ConversionBadgeProps) {
  if (converted) {
    return (
      <Badge
        variant="outline"
        className="border-green-200 bg-green-50 text-green-700 gap-1.5 font-bold px-2 py-0.5"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Shipment Created
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-accent-light/30 bg-accent-light/5 text-accent-dark font-black px-2 py-0.5"
    >
      <Zap className="h-3.5 w-3.5 fill-accent-light/20" />
      Shipping Estimate
    </Badge>
  );
}
