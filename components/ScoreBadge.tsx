// components/ScoreBadge.tsx
import { Badge } from "@/components/ui/badge";

interface ScoreBadgeProps {
  score: number;
  withText?: boolean;
}

export function ScoreBadge({ score, withText = false }: ScoreBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={
        score <= 4
          ? "bg-red-100 text-red-800 border-red-200"
          : score <= 7
            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
            : "bg-green-100 text-green-800 border-green-200"
      }
    >
      {withText ? `Score: ${score}` : score}
    </Badge>
  );
}
