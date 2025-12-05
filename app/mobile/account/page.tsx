import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, CreditCard, FileText } from "lucide-react";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: {
      nombre: true,
      email: true,
      dni: true,
      brevete: true,
      rol: true,
    },
  });

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Mi Cuenta</h1>
        <p className="text-muted-foreground">Detalles de tu perfil.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Nombre</p>
              <p className="text-sm text-muted-foreground">{user.nombre}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Correo</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">DNI</p>
              <p className="text-sm text-muted-foreground">
                {user.dni || "No registrado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Brevete</p>
              <p className="text-sm text-muted-foreground">
                {user.brevete || "No registrado"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
