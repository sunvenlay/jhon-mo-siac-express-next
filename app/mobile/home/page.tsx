import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Fuel,
  History,
  ChevronRight,
  AlertTriangle,
  MapPin,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

export default async function DriverHome() {
  const user = await getSessionUser();

  const [activeTrip, recentTrips] = user
    ? await Promise.all([
        prisma.viaje.findFirst({
          where: {
            conductorId: user.id,
            fechaFin: null,
          },
          include: {
            vehiculo: true,
          },
        }),
        prisma.viaje.findMany({
          where: {
            conductorId: user.id,
            fechaFin: { not: null },
          },
          orderBy: { fechaFin: "desc" },
          take: 5,
        }),
      ])
    : [null, []];

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto pb-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Hola, {user?.name?.split(" ")[0] || "Conductor"}
        </h1>
        <p className="text-muted-foreground">¿Qué deseas hacer hoy?</p>
      </div>

      {/* Primary Actions */}
      <div className="grid gap-4">
        {!activeTrip && (
          <Link href="/mobile/trip/new">
            <Card className="group hover:shadow-md transition-all cursor-pointer border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Iniciar Nuevo Viaje
                </CardTitle>
                <Truck className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Registra salida, kilometraje y destino.
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link
          href={
            activeTrip
              ? `/mobile/expense?viajeId=${activeTrip.id}`
              : "/mobile/expense"
          }
        >
          <Card className="group hover:shadow-md transition-all cursor-pointer border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Registrar Gasto
              </CardTitle>
              <Fuel className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Combustible, peajes o mantenimiento.
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Status / Alerts */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Estado Actual
        </h3>

        {activeTrip ? (
          <Link href={`/mobile/trip/${activeTrip.id}`}>
            <Card className="bg-blue-50/50 border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                      <Truck className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-blue-900">En Ruta</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                  >
                    Ver Detalles <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Origen
                    </span>
                    <p className="font-medium text-sm truncate">
                      {activeTrip.origen}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Navigation className="h-3 w-3" /> Destino
                    </span>
                    <p className="font-medium text-sm truncate">
                      {activeTrip.destino}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/50 flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Vehículo:{" "}
                    <span className="font-medium text-foreground">
                      {activeTrip.vehiculo.placa}
                    </span>
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Activo
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="bg-muted/50 border-none">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Sin viaje activo</p>
                <p className="text-xs text-muted-foreground">
                  Listo para iniciar ruta
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Recientes
          </h3>
          <Link href="/mobile/history">
            <Button variant="ghost" size="sm" className="text-xs">
              Ver todo <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentTrips.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No hay viajes recientes
            </p>
          ) : (
            recentTrips.map((trip) => {
              const duration = trip.fechaFin
                ? Math.round(
                    (trip.fechaFin.getTime() - trip.fechaInicio.getTime()) /
                      (1000 * 60 * 60)
                  )
                : 0;

              const daysAgo = Math.floor(
                (new Date().getTime() - trip.fechaInicio.getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={trip.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {trip.origen} &rarr; {trip.destino}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Hace {daysAgo} días • {duration}h
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Completado
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
