import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface CreateViajePayload {
    conductorId: string;
    vehiculoId: string;
    origen: string;
    destino: string;
    kmInicial: number;
}

interface UpdateViajePayload {
    id: string;
    kmFinal: number;
}

export async function GET() {
    try {
        const viajes = await prisma.viaje.findMany({
            take: 10,
            orderBy: {
                fechaInicio: 'desc',
            },
            include: {
                conductor: true,
                vehiculo: true,
                gastos: true,
            },
        });
        return NextResponse.json({ data: viajes });
    } catch (error) {
        console.error("GET /api/viajes error", error);
        return NextResponse.json(
            { error: "Error al obtener los viajes." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body: CreateViajePayload = await request.json();
        const { conductorId, vehiculoId, origen, destino, kmInicial } = body;

        if (!conductorId || !vehiculoId || !origen || !destino || kmInicial === undefined) {
            return NextResponse.json(
                { error: "Faltan datos obligatorios para iniciar el viaje." },
                { status: 400 }
            );
        }

        // Verificar si el vehículo está disponible
        const vehiculo = await prisma.vehiculo.findUnique({
            where: { id: vehiculoId },
        });

        if (!vehiculo) {
            return NextResponse.json({ error: "Vehículo no encontrado." }, { status: 404 });
        }

        if (vehiculo.estado !== "DISPONIBLE") {
            return NextResponse.json(
                { error: "El vehículo no está disponible." },
                { status: 409 }
            );
        }

        // Crear el viaje y actualizar estado del vehículo
        const [viaje] = await prisma.$transaction([
            prisma.viaje.create({
                data: {
                    conductorId,
                    vehiculoId,
                    origen,
                    destino,
                    kmInicial,
                    fechaInicio: new Date(),
                },
            }),
            prisma.vehiculo.update({
                where: { id: vehiculoId },
                data: {
                    estado: "EN_RUTA",
                    conductorActualId: conductorId,
                },
            }),
        ]);

        return NextResponse.json({ data: viaje }, { status: 201 });
    } catch (error) {
        console.error("POST /api/viajes error", error);
        return NextResponse.json(
            { error: "Error al registrar el viaje." },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body: UpdateViajePayload = await request.json();
        const { id, kmFinal } = body;

        if (!id || kmFinal === undefined) {
            return NextResponse.json(
                { error: "ID del viaje y kilometraje final son obligatorios." },
                { status: 400 }
            );
        }

        const viaje = await prisma.viaje.findUnique({
            where: { id },
        });

        if (!viaje) {
            return NextResponse.json({ error: "Viaje no encontrado." }, { status: 404 });
        }

        const distanciaTotal = kmFinal - viaje.kmInicial;

        if (distanciaTotal < 0) {
            return NextResponse.json(
                { error: "El kilometraje final no puede ser menor al inicial." },
                { status: 400 }
            );
        }

        // Cerrar viaje y liberar vehículo
        const [viajeActualizado] = await prisma.$transaction([
            prisma.viaje.update({
                where: { id },
                data: {
                    kmFinal,
                    fechaFin: new Date(),
                    distanciaTotal,
                },
            }),
            prisma.vehiculo.update({
                where: { id: viaje.vehiculoId },
                data: {
                    estado: "DISPONIBLE",
                    kilometraje: kmFinal,
                    conductorActualId: null,
                },
            }),
        ]);

        return NextResponse.json({ data: viajeActualizado });
    } catch (error) {
        console.error("PATCH /api/viajes error", error);
        return NextResponse.json(
            { error: "Error al finalizar el viaje." },
            { status: 500 }
        );
    }
}
