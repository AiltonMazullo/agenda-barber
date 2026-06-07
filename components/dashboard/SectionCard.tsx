import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  actionLabel: string;
  /** Destino do link da ação (ex.: "/schedule"). */
  actionHref?: string;
  children: ReactNode;
}

export function SectionCard({
  icon,
  title,
  actionLabel,
  actionHref,
  children,
}: SectionCardProps) {
  return (
    <Card className="bg-surface-raised border-border">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-2 text-brand">
          {icon}
          <CardTitle className="text-sm font-bold text-foreground uppercase">
            {title}
          </CardTitle>
        </div>
        {actionHref ? (
          <Link
            href={actionHref}
            className="text-brand text-xs font-medium flex items-center gap-1 hover:underline"
          >
            {actionLabel} <ArrowUpRight className="size-3" />
          </Link>
        ) : (
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            {actionLabel} <ArrowUpRight className="size-3" />
          </span>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
