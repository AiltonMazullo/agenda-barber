import type { ReactNode } from "react";
import Image from "next/image";
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
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/Logo-Agendle-05.png"
          alt="Agendle"
          width={170}
          height={48}
          className="object-contain"
          priority
        />
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
