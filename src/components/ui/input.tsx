import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          className={cn(
            "flex h-9 w-full rounded-lg border bg-secondary/10 px-3 py-1 text-sm backdrop-blur-sm transition-all",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring focus-visible:bg-secondary/5",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive/50"
              : "border-border/40 hover:border-border/60",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
