import { type ReactNode } from "react";

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  hint?: string;
}

export function DashboardCard({
  icon,
  title,
  value,
  hint,
}: DashboardCardProps) {
  return (
    <div className="glass rounded-2xl p-4 transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-card-foreground break-words">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

interface DashboardStatsProps {
  icon: ReactNode;
  label: string;
  value: number;
}

export function DashboardStats({ icon, label, value }: DashboardStatsProps) {
  return (
    <div className="glass rounded-2xl p-5 transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-foreground tabular-nums">
        {value}
      </p>
    </div>
  );
}
