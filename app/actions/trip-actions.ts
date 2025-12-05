"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function finalizeTrip(tripId: string) {
  try {
    // 1. Get the trip to find the vehicle ID
    const trip = await prisma.viaje.findUnique({
      where: { id: tripId },
      select: { vehiculoId: true },
    });

    if (!trip) {
      return { error: "Viaje no encontrado" };
    }

    // 2. Update Trip (set end date) and Vehicle (set status to AVAILABLE)
    await prisma.$transaction([
      prisma.viaje.update({
        where: { id: tripId },
        data: { fechaFin: new Date() },
      }),
      prisma.vehiculo.update({
        where: { id: trip.vehiculoId },
        data: { estado: "DISPONIBLE" },
      }),
    ]);

    // 3. Revalidate paths
    revalidatePath("/mobile/home");
    revalidatePath(`/mobile/trip/${tripId}`);
    revalidatePath("/dashboard/fleet");

    return { success: true };
  } catch (error) {
    console.error("Error finalizing trip:", error);
    return { error: "Error al finalizar el viaje" };
  }
}
