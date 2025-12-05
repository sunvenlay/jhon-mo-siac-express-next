import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { TipoGasto } from "@prisma/client"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { vehiculoId, monto, descripcion, viajeId, galones, imagenUrl, tipo } = body

        if (!vehiculoId || !monto) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // If no trip ID is provided, we might need to find an active trip for this vehicle
        let targetViajeId = viajeId

        if (!targetViajeId) {
            const activeTrip = await prisma.viaje.findFirst({
                where: {
                    vehiculoId: vehiculoId,
                    fechaFin: null
                },
                orderBy: { fechaInicio: 'desc' }
            })

            if (!activeTrip) {
                return new NextResponse("No active trip found for this vehicle", { status: 400 })
            }
            targetViajeId = activeTrip.id
        }

        const gasto = await prisma.gasto.create({
            data: {
                tipo: (tipo as TipoGasto) || TipoGasto.OTROS,
                monto: Number(monto),
                galones: galones ? Number(galones) : null,
                imagenUrl: imagenUrl || null,
                descripcion: descripcion || "Gasto registrado",
                viajeId: targetViajeId,
                fecha: new Date()
            }
        })

        return NextResponse.json(gasto)
    } catch (error) {
        console.error("[GASTOS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
