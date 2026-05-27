import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientAuthProvider } from "@/contexts/ClientAuthContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agendle Barber",
  description: "Sistema de Gestão para Barbearias",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body
        className={`${inter.className} min-h-full bg-background text-foreground`}
      >
        <AuthProvider>
          <ClientAuthProvider>{children}</ClientAuthProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
