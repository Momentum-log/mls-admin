import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText } from "lucide-react";

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
 * - **Not converted (false)**: Neutral outline badge with "Shipping Estimate"
 */
export default function ConversionBadge({ converted }: ConversionBadgeProps) {
  if (converted) {
    return (
      <Badge
        variant="outline"
        className="border-green-200 bg-green-50 text-green-700 gap-1"
      >
        <CheckCircle className="h-3 w-3" />
        Shipment Created
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <FileText className="h-3 w-3" />
      Shipping Estimate
    </Badge>
  );
}
