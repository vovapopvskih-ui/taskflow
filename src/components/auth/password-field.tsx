"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  id: string;
  name: string;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  showStrength?: boolean;
}

const strengthChecks = [
  { label: "минимум 8 символов", test: (v: string) => v.length >= 8 },
  { label: "одна цифра", test: (v: string) => /[0-9]/.test(v) },
  { label: "одна большая буква", test: (v: string) => /[A-ZА-Я]/.test(v) },
];

export function PasswordField({
  id,
  name,
  placeholder,
  error,
  autoComplete = "current-password",
  showStrength = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          error={error}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <ul className="mt-2 space-y-1">
          {strengthChecks.map((check) => {
            const passed = check.test(value);
            return (
              <li
                key={check.label}
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  passed ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    passed ? "bg-status-done" : "bg-muted-foreground/40",
                  )}
                />
                {check.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
