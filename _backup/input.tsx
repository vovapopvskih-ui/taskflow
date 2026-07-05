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
            "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive"
              : "border-input hover:border-border",
            className,
          )}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
