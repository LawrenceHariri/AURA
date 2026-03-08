import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    success: "bg-emerald-900/40 text-emerald-400 border border-emerald-800",
    warning: "bg-amber-900/40 text-amber-400 border border-amber-800",
    danger: "bg-red-900/40 text-red-400 border border-red-800",
    info: "bg-violet-900/40 text-violet-400 border border-violet-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
