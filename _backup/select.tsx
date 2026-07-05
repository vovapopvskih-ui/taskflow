import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, id, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          id={id}
          className={cn(
            "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
            "appearance-none [-webkit-appearance:none] bg-no-repeat",
            // Стрелка вниз (SVG inline, цвет подхватывается от currentColor)
            "bg-[length:16px_16px] bg-[right_0.5rem_center] pr-9",
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%2C9%2012%2C15%2018%2C9%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]",
            "text-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive" : "border-input hover:border-border",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
