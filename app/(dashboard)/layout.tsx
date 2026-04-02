import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Navbar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-6 bg-(--primary) ">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
