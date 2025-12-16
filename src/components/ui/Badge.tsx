import { cn, getStatusColor } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "default" | "status" | "category";
  status?: string;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  status,
  children,
  className,
}: BadgeProps) {
  if (variant === "status" && status) {
    const colors = getStatusColor(status);
    return (
      <span
        className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full border",
          colors.bg,
          colors.text,
          colors.border,
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === "category") {
    return (
      <span
        className={cn(
          "bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-black",
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "bg-primary text-border-dark px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-border-dark",
        className
      )}
    >
      {children}
    </span>
  );
}
