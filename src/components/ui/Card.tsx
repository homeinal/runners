import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "featured" | "section";
  children: ReactNode;
}

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  const variants = {
    default:
      "bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-[var(--shadow-neobrutalism)] p-4 hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all",
    featured:
      "border-4 border-border-dark bg-primary rounded-xl overflow-hidden shadow-[var(--shadow-neobrutalism)] transition-transform duration-300 hover:-translate-y-1",
    section:
      "bg-white border-2 border-border-dark shadow-[var(--shadow-neobrutalism)] p-6 md:p-8 hover:bg-yellow-50 transition-colors",
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
