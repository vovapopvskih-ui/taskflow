import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

const variantStyles = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.98] border border-transparent",
  secondary:
    "bg-secondary/15 text-secondary-foreground backdrop-blur-md border border-border/40 hover:bg-secondary/25 active:scale-[0.98]",
  outline:
    "bg-transparent text-foreground border border-border/50 hover:bg-secondary/10 active:scale-[0.98]",
  ghost:
    "bg-transparent text-foreground hover:bg-secondary/15 active:scale-[0.98] border border-transparent",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:brightness-110 active:scale-[0.98] border border-transparent",
};

const sizeStyles = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-9 px-4 text-sm rounded-lg",
  lg: "h-11 px-6 text-sm rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
