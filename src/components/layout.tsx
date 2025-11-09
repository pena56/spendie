import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full border-black border-2 relative">
        <nav className="p-2 flex items-center gap-4 border-b-black border-b-2 w-full sticky inset-0 bg-white z-10">
          <SidebarTrigger />

          <p className="text-2xl font-semibold">{title}</p>
        </nav>

        <div className="p-4 flex flex-col space-y-6 pb-20">{children}</div>
      </main>
    </SidebarProvider>
  );
}
