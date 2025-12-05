import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const conductorSelection = {
  id: true,
  nombre: true,
  email: true,
};

const ESTADOS_VEHICULO = [
  "DISPONIBLE",
  "EN_RUTA",
  "MANTENIMIENTO",
] as const;

type EstadoVehiculo = (typeof ESTADOS_VEHICULO)[number];

export async function GET() {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: { 
        conductorActual: { select: conductorSelection },
        soat: true,
        certificado: true,
      },
      orderBy: { placa: "asc" },
    });

    return NextResponse.json({ data: vehiculos });
  } catch (error) {
    console.error("GET /api/vehiculos error", error);
    return NextResponse.json(
      { error: "No se pudo obtener el listado de vehículos." },
      { status: 500 }
    );
  }
}

interface VehiculoPayload {
  placa?: string;
  modelo?: string;
  capacidad?: number;
  kilometraje?: number;
  estado?: EstadoVehiculo;
  conductorActualId?: string;
  soat?: {
    numero: string;
    fechaVigencia: string;
    fechaCaducidad: string;
  };
  certificado?: {
    numero: string;
    fechaVigencia: string;
    fechaCaducidad: string;
  };
}

function sanitizeVehiculoPayload(payload: VehiculoPayload) {
  const errors: string[] = [];
  const placa = payload.placa?.trim();
  const modelo = payload.modelo?.trim();
  const capacidad = Number(payload.capacidad);
  const kilometraje =
    payload.kilometraje === undefined ? undefined : Number(payload.kilometraje);
  const estadoEntrada =
    typeof payload.estado === "string" ? payload.estado.toUpperCase() : undefined;
  const estado = ESTADOS_VEHICULO.find((value) => value === estadoEntrada) ?? "DISPONIBLE";
  const conductorActualId = payload.conductorActualId || null;

  if (!placa) errors.push("La placa es obligatoria.");
  if (!modelo) errors.push("El modelo es obligatorio.");
  if (Number.isNaN(capacidad) || capacidad <= 0)
    errors.push("La capacidad debe ser un número positivo.");
  if (
    kilometraje !== undefined && (Number.isNaN(kilometraje) || kilometraje < 0)
  ) {
    errors.push("El kilometraje debe ser un número positivo.");
  }

  // Validar SOAT si se proporciona
  if (payload.soat) {
    if (!payload.soat.numero) errors.push("El número de SOAT es obligatorio.");
    if (!payload.soat.fechaVigencia) errors.push("La vigencia del SOAT es obligatoria.");
    if (!payload.soat.fechaCaducidad) errors.push("La caducidad del SOAT es obligatoria.");
  }

  // Validar Certificado si se proporciona
  if (payload.certificado) {
    if (!payload.certificado.numero) errors.push("El número de Certificado es obligatorio.");
    if (!payload.certificado.fechaVigencia) errors.push("La vigencia del Certificado es obligatoria.");
    if (!payload.certificado.fechaCaducidad) errors.push("La caducidad del Certificado es obligatoria.");
  }

  return {
    errors,
    data: placa && modelo && !Number.isNaN(capacidad)
      ? {
          placa: placa.toUpperCase(),
          modelo,
          capacidad,
          kilometraje,
          estado,
          conductorActualId,
          soat: payload.soat,
          certificado: payload.certificado,
        }
      : null,
  } as const;
}

const isUniqueConstraintError = (error: unknown): error is { code: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    (error as { code: string }).code === "P2002"
  );
};

export async function POST(request: Request) {
  try {
    const payload: VehiculoPayload = await request.json();
    const { errors, data } = sanitizeVehiculoPayload(payload);

    if (errors.length || !data) {
      return NextResponse.json(
        { error: errors.join(" ") || "Datos inválidos" },
        { status: 400 }
      );
    }

    const vehiculo = await prisma.vehiculo.create({
      data: {
        placa: data.placa,
        modelo: data.modelo,
        capacidad: data.capacidad,
        kilometraje: data.kilometraje,
        estado: data.estado,
        conductorActualId: data.conductorActualId,
        soat: data.soat ? {
          create: {
            numero: data.soat.numero,
            fechaVigencia: new Date(data.soat.fechaVigencia),
            fechaCaducidad: new Date(data.soat.fechaCaducidad),
          }
        } : undefined,
        certificado: data.certificado ? {
          create: {
            numero: data.certificado.numero,
            fechaVigencia: new Date(data.certificado.fechaVigencia),
            fechaCaducidad: new Date(data.certificado.fechaCaducidad),
          }
        } : undefined,
      },
      include: { 
        conductorActual: { select: conductorSelection },
        soat: true,
        certificado: true,
      },
    });

    return NextResponse.json({ data: vehiculo }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/vehiculos error", error);
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Ya existe un vehículo con esa placa." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "No se pudo registrar el vehículo." },
      { status: 500 }
    );
  }
}
