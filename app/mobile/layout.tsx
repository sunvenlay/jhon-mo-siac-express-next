import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Truck, LogOut } from "lucide-react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationPanel } from "@/components/notification-panel";
import { prisma } from "@/lib/prisma";

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const notifications = await prisma.notificacion.findMany({
    where: { usuarioId: session.user?.id },
    orderBy: { fecha: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[350px]">
              <div className="flex flex-col gap-6 py-4">
                <div className="flex items-center gap-2 px-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle>Jhon Mo S.I.A.C.</SheetTitle>
                    <SheetDescription>Gestión de Flotas</SheetDescription>
                  </div>
                </div>
                <Separator />
                <nav className="flex flex-col gap-2 px-2">
                  <Link
                    href="/mobile/home"
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/mobile/trip/new"
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  >
                    Nuevo Viaje
                  </Link>
                  <Link
                    href="/mobile/expense"
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  >
                    Registrar Gasto
                  </Link>
                  <Link
                    href="/mobile/history"
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  >
                    Historial
                  </Link>
                  <Link
                    href="/mobile/account"
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  >
                    Mi Cuenta
                  </Link>
                </nav>
                <Separator />
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                  className="px-2"
                >
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Conductor</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationPanel notifications={notifications} />
          <Avatar>
            <AvatarImage src={session.user?.image || ""} />
            <AvatarFallback>
              {session.user?.name?.charAt(0) || "C"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
