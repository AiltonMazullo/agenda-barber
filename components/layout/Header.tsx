"use client";

import { Bell, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />

      {/* Breadcrumb / página atual — pode ser dinâmico depois */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-medium">Barbearia do José</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notificações */}
        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
        </Button>

        {/* Avatar / menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="size-8 rounded-full p-0" />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-amber-500 text-black text-xs font-bold">
                JS
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-red-400">
              <LogOut className="size-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
