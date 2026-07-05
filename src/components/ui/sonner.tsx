"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm",
          title: "text-sm font-medium text-card-foreground",
          description: "text-sm text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs font-medium",
          cancelButton:
            "bg-muted text-muted-foreground rounded-md px-3 py-1.5 text-xs font-medium",
          success: "border-l-2 border-l-green-500",
          error: "border-l-2 border-l-destructive",
        },
      }}
      richColors={false}
    />
  );
}
