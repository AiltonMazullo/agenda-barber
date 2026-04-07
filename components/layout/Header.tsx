"use client";

import { Bell, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-medium">Barbearia do José</span>
      </div>

      <div className="ml-auto flex items-center gap-2">

        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer relative size-8"
        >
          <Bell className="size-4" />
        </Button>
        <Button
          // onClick={handleLogout}
          variant="ghost"
          size="icon"
          className="cursor-pointer relative size-8"
        >
          <LogOut className="size-4" />
        </Button>

        <Avatar className="size-8">
          <AvatarFallback className="bg-[#3f340d] text-yellow-500 text-xs font-bold">
            JS
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
