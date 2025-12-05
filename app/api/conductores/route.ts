import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const conductorSelection = {
  id: true,
  nombre: true,
  email: true,
  dni: true,
  brevete: true,
  creadoEn: true,
};

interface ConductorPayload {
  nombre?: string;
  email?: string;
  password?: string;
  dni?: string;
  brevete?: string;
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

export async function GET() {
  try {
    const conductores = await prisma.usuario.findMany({
      where: { rol: "CONDUCTOR" },
      select: conductorSelection,
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({ data: conductores });
  } catch (error: unknown) {
    console.error("GET /api/conductores error", error);
    return NextResponse.json(
      { error: "No se pudo listar a los conductores." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nombre, email, password, dni, brevete }: ConductorPayload = await request.json();

    if (!nombre?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const conductor = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        rol: "CONDUCTOR",
        dni: dni?.trim(),
        brevete: brevete?.trim(),
      },
      select: conductorSelection,
    });

    return NextResponse.json({ data: conductor }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/conductores error", error);
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Ya existe un conductor registrado con ese correo." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "No se pudo registrar el conductor." },
      { status: 500 }
    );
  }
}
