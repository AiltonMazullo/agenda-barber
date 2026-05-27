"use client";

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
  icon: ReactNode;
  type?: "text" | "email" | "password" | "tel";
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput(
    { id, label, icon, type = "text", className, error, ...rest },
    ref,
  ) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const effectiveType = isPassword && showPassword ? "text" : type;

    return (
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={id}
          className="text-muted-foreground text-xs font-normal"
        >
          {label}
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none">
            {icon}
          </span>
          <Input
            id={id}
            ref={ref}
            type={effectiveType}
            aria-invalid={error ? true : undefined}
            className={cn(
              "bg-black border-none shadow-xl text-foreground h-11 pl-10 rounded-md focus-visible:ring-1 focus-visible:ring-brand placeholder:text-text-faint",
              isPassword && "pr-10",
              error && "ring-1 ring-danger/60 focus-visible:ring-danger",
              className,
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-foreground transition-colors"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-[11px] text-danger-foreground leading-tight">
            {error}
          </p>
        )}
      </div>
    );
  },
);
