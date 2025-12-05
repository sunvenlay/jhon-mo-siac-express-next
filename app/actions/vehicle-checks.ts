"use server";

import { prisma } from "@/lib/prisma";
import { createNotification } from "./notifications";

export async function checkDocumentExpirations() {
  try {
    const today = new Date();
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + 7); // Alert 7 days before

    const vehicles = await prisma.vehiculo.findMany({
      where: {
        OR: [
          {
            soat: {
              fechaCaducidad: {
                lte: warningDate,
              },
            },
          },
          {
            certificado: {
              fechaCaducidad: {
                lte: warningDate,
              },
            },
          },
        ],
      },
      include: {
        soat: true,
        certificado: true,
        conductorActual: true,
      },
    });

    const admins = await prisma.usuario.findMany({
      where: { rol: "ADMIN" },
    });

    let notificationCount = 0;

    for (const vehicle of vehicles) {
      // Check SOAT
      if (vehicle.soat) {
        const daysLeft = Math.ceil(
          (vehicle.soat.fechaCaducidad.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysLeft <= 7) {
            let message = "";
            if (daysLeft < 0) {
                message = `ALERTA: El SOAT del vehículo ${vehicle.placa} venció hace ${Math.abs(daysLeft)} días.`;
            } else {
                message = `AVISO: El SOAT del vehículo ${vehicle.placa} vence en ${daysLeft} días.`;
            }
            
            // Check if notification already exists (unread) for admins
            for (const admin of admins) {
                const existingNotification = await prisma.notificacion.findFirst({
                    where: {
                        usuarioId: admin.id,
                        mensaje: message,
                        leido: false,
                    }
                });
                
                if (!existingNotification) {
                    await createNotification(admin.id, message);
                    notificationCount++;
                }
            }
            
            // Check if notification already exists for driver
            if (vehicle.conductorActual) {
                const existingNotification = await prisma.notificacion.findFirst({
                    where: {
                        usuarioId: vehicle.conductorActual.id,
                        mensaje: message,
                        leido: false,
                    }
                });
                
                if (!existingNotification) {
                    await createNotification(vehicle.conductorActual.id, message);
                    notificationCount++;
                }
            }
        }
      }

      // Check Certificate
      if (vehicle.certificado) {
        const daysLeft = Math.ceil(
          (vehicle.certificado.fechaCaducidad.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysLeft <= 7) {
            let message = "";
            if (daysLeft < 0) {
                message = `ALERTA: El Certificado del vehículo ${vehicle.placa} venció hace ${Math.abs(daysLeft)} días.`;
            } else {
                message = `AVISO: El Certificado del vehículo ${vehicle.placa} vence en ${daysLeft} días.`;
            }

            // Check if notification already exists for admins
            for (const admin of admins) {
                const existingNotification = await prisma.notificacion.findFirst({
                    where: {
                        usuarioId: admin.id,
                        mensaje: message,
                        leido: false,
                    }
                });
                
                if (!existingNotification) {
                    await createNotification(admin.id, message);
                    notificationCount++;
                }
            }
            
            // Check if notification already exists for driver
            if (vehicle.conductorActual) {
                const existingNotification = await prisma.notificacion.findFirst({
                    where: {
                        usuarioId: vehicle.conductorActual.id,
                        mensaje: message,
                        leido: false,
                    }
                });
                
                if (!existingNotification) {
                    await createNotification(vehicle.conductorActual.id, message);
                    notificationCount++;
                }
            }
        }
      }
    }

    return { success: true, count: notificationCount };
  } catch (error) {
    console.error("Error checking document expirations:", error);
    return { error: "Error al verificar documentos" };
  }
}
