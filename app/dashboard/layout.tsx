import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationPanel } from "@/components/notification-panel";
import { getSessionUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { checkDocumentExpirations } from "@/app/actions/vehicle-checks";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  // Run checks if user is admin
  if (user?.role === "ADMIN") {
    await checkDocumentExpirations();
  }

  const notifications = user
    ? await prisma.notificacion.findMany({
        where: { usuarioId: user.id },
        orderBy: { fecha: "desc" },
        take: 20,
      })
    : [];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <NotificationPanel notifications={notifications} />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
