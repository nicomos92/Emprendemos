import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

const trendStyles: Record<NonNullable<StatCardProps["trend"]>, string> = {
  up: "text-success-600",
  down: "text-danger-600",
  neutral: "text-neutral-500",
};

export function StatCard({ label, value, sublabel, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white p-4 shadow-sm", className)}>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-700">{value}</p>
      {sublabel && (
        <p className={cn("mt-1 text-xs", trend ? trendStyles[trend] : "text-neutral-500")}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
