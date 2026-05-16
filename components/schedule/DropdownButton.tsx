import type { ReactNode } from "react";

interface DropdownButtonProps {
  children: ReactNode;
  className?: string;
}

export function DropdownButton({ children, className }: DropdownButtonProps) {
  return (
    <div role="button" tabIndex={0} className={className}>
      {children}
    </div>
  );
}
