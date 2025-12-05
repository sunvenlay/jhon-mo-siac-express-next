"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications(userId: string) {
  try {
    const notifications = await prisma.notificacion.findMany({
      where: { usuarioId: userId },
      orderBy: { fecha: "desc" },
    });
    return { data: notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { error: "Error al obtener notificaciones" };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notificacion.update({
      where: { id: notificationId },
      data: { leido: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { error: "Error al marcar como leída" };
  }
}

export async function createNotification(userId: string, message: string) {
  try {
    await prisma.notificacion.create({
      data: {
        usuarioId: userId,
        mensaje: message,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { error: "Error al crear notificación" };
  }
}
