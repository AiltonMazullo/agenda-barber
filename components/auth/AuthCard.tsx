import type { ReactNode } from "react";
import { Scissors } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-4 font-sans">
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="flex size-14 items-center justify-center rounded-xl bg-brand">
          <Scissors className="size-7 text-brand-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Smart Man OS
          </h1>
          <p className="text-muted-foreground text-xs font-medium">
            Sistema de Gestão para Barbearias
          </p>
        </div>
      </div>

      <Card className="w-full max-w-[450px] bg-surface-raised border-border shadow-xl">
        <CardHeader className="text-center pt-2 pb-1">
          <CardTitle className="text-lg font-semibold text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-[12px]">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-8 pb-8">
          {children}
        </CardContent>
      </Card>

      {footer}

      <p className="mt-8 text-[10px] text-text-faint uppercase tracking-widest">
        Smart Man OS © 2026
      </p>
    </div>
  );
}
