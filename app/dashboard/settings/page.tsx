import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
    title: "Configuración | Jhon Mo S.A.C.",
    description: "Administración de cuenta y seguridad",
}

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="space-y-0.5">
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">
                    Administra tu cuenta y preferencias de seguridad.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <div className="flex-1 lg:max-w-2xl">
                    <Tabs defaultValue="general" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="security">Seguridad</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información de Perfil</CardTitle>
                                    <CardDescription>
                                        Detalles de tu cuenta de usuario.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input id="name" value={session.user.name || ""} disabled />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" value={session.user.email || ""} disabled />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Rol</Label>
                                        <Input id="role" value={(session.user as any).role || ""} disabled />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="security" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contraseña</CardTitle>
                                    <CardDescription>
                                        Cambia tu contraseña o recupera el acceso.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current">Contraseña Actual</Label>
                                        <Input id="current" type="password" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="new">Nueva Contraseña</Label>
                                        <Input id="new" type="password" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm">Confirmar Contraseña</Label>
                                        <Input id="confirm" type="password" />
                                    </div>
                                    <Button>Actualizar Contraseña</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
