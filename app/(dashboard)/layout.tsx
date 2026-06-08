import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true} className="h-svh overflow-hidden">
      <Navbar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-6 bg-(--primary) min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
