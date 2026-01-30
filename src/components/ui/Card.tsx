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
      "bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism) p-4 hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all",
    featured:
      "border-4 border-border-dark dark:border-white bg-primary rounded-xl overflow-hidden shadow-(--shadow-neobrutalism) transition-transform duration-300 hover:-translate-y-1",
    section:
      "bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white shadow-(--shadow-neobrutalism) p-6 md:p-8 hover:bg-yellow-50 dark:hover:bg-background-dark/80 transition-colors",
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
