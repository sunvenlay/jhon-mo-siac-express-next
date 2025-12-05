import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { TripForm } from "@/components/driver/trip-form"
import { ExpenseForm } from "@/components/driver/expense-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export const metadata: Metadata = {
    title: "Panel de Conductor | Jhon Mo S.A.C.",
    description: "Registro de viajes y gastos",
}

export const dynamic = "force-dynamic"

export default async function DriverDashboardPage() {
    // TODO: Integrate with real Auth. For MVP, we pick the first driver found.
    const driver = await prisma.usuario.findFirst({
        where: { rol: "CONDUCTOR" },
    })

    if (!driver) {
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        No se encontró ningún conductor registrado en el sistema.
                        Por favor, registre uno desde el panel administrativo.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Check for active trip
    const activeTrip = await prisma.viaje.findFirst({
        where: {
            conductorId: driver.id,
            fechaFin: null,
        },
        include: {
            vehiculo: true,
        },
    })

    // Get available vehicles (only if no active trip)
    const availableVehicles = !activeTrip
        ? await prisma.vehiculo.findMany({
            where: { estado: "DISPONIBLE" },
            orderBy: { placa: "asc" },
        })
        : []

    return (
        <div className="container max-w-md mx-auto p-4 space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold">Hola, {driver.nombre}</h1>
                <p className="text-muted-foreground">Panel de Operaciones</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{activeTrip ? "Viaje en Curso" : "Iniciar Nuevo Viaje"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <TripForm
                        activeTrip={activeTrip}
                        conductorId={driver.id}
                        availableVehicles={availableVehicles}
                    />
                </CardContent>
            </Card>

            {activeTrip && (
                <Card>
                    <CardHeader>
                        <CardTitle>Reportar Gasto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ExpenseForm viajeId={activeTrip.id} />
                    </CardContent>
                </Card>
            )}

            {!activeTrip && availableVehicles.length === 0 && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Información</AlertTitle>
                    <AlertDescription>
                        No hay vehículos disponibles en este momento.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
