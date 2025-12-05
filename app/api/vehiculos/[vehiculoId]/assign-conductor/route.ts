import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const conductorSelection = {
  id: true,
  nombre: true,
  email: true,
};

interface AssignPayload {
  conductorId?: string;
}

const isNotFoundError = (error: unknown): error is { code: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    (error as { code: string }).code === "P2025"
  );
};

export async function PATCH(
  request: Request,
  props: { params: Promise<{ vehiculoId: string }> }
) {
  const params = await props.params;
  try {
    const { conductorId }: AssignPayload = await request.json();

    if (!conductorId) {
      return NextResponse.json(
        { error: "El identificador del conductor es obligatorio." },
        { status: 400 }
      );
    }

    const conductor = await prisma.usuario.findUnique({
      where: { id: conductorId },
      select: { id: true, rol: true },
    });

    if (!conductor || conductor.rol !== "CONDUCTOR") {
      return NextResponse.json(
        { error: "El conductor indicado no existe o no es válido." },
        { status: 404 }
      );
    }

    const vehiculo = await prisma.vehiculo.update({
      where: { id: params.vehiculoId },
      data: { conductorActualId: conductorId } as any,
      include: { conductorActual: { select: conductorSelection } } as any,
    });

    return NextResponse.json({ data: vehiculo });
  } catch (error: unknown) {
    console.error("PATCH /api/vehiculos/[id]/assign-conductor error", error);

    if (isNotFoundError(error)) {
      return NextResponse.json(
        { error: "El vehículo indicado no existe." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "No se pudo asignar el conductor al vehículo." },
      { status: 500 }
    );
  }
}
