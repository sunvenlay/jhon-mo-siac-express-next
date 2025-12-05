import { prisma } from "@/lib/prisma"
import { TripsTableClient } from "@/components/dashboard/trips-table-client"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Historial de Viajes | Jhon Mo S.A.C.",
    description: "Registro completo de viajes y costos",
}

export const dynamic = "force-dynamic"

export default async function TripsPage() {
    const trips = await prisma.viaje.findMany({
        orderBy: { fechaInicio: "desc" },
        include: {
            vehiculo: true,
            gastos: true,
            prediccion: true,
        },
    })

    const formattedTrips = trips.map(trip => {
        const costoReal = trip.gastos.reduce((sum, g) => sum + g.monto, 0)
        const costoEstimado = trip.prediccion?.costoEstimado || 0

        return {
            id: trip.id,
            fecha: trip.fechaInicio,
            placa: trip.vehiculo.placa,
            origen: trip.origen,
            destino: trip.destino,
            costoEstimado,
            costoReal,
            estado: trip.fechaFin ? "COMPLETADO" : "EN PROGRESO",
        }
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Historial de Viajes</h2>
            </div>
            <TripsTableClient trips={formattedTrips} />
        </div>
    )
}
