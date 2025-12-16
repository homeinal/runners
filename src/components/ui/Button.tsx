import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-bold uppercase border-2 border-border-dark rounded-full transition-all duration-200";

  const variants = {
    primary:
      "bg-primary text-border-dark shadow-[var(--shadow-neobrutalism)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[var(--shadow-neobrutalism-active)] active:translate-x-[4px] active:translate-y-[4px]",
    secondary:
      "bg-white dark:bg-background-dark text-border-dark dark:text-white dark:border-white shadow-[var(--shadow-neobrutalism)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[var(--shadow-neobrutalism-active)] active:translate-x-[4px] active:translate-y-[4px]",
    outline:
      "bg-white dark:bg-transparent text-border-dark dark:text-white dark:border-white hover:bg-border-dark hover:text-white dark:hover:bg-white dark:hover:text-border-dark",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-sm",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
