import { prisma } from "@/lib/prisma"
import FleetMapWrapper from "./fleet-map-wrapper"

export async function FleetMap() {
    const vehicles = await prisma.vehiculo.findMany({
        select: {
            id: true,
            placa: true,
            latitud: true,
            longitud: true,
            estado: true,
        },
    })

    return <FleetMapWrapper vehicles={vehicles} />
}
