import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { MapPin, Navigation, Calendar, ChevronRight } from "lucide-react";

export default async function TripHistoryPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">
          Inicie sesión para ver su historial.
        </p>
      </div>
    );
  }

  const trips = await prisma.viaje.findMany({
    where: {
      conductorId: user.id,
      fechaFin: { not: null }, // Only completed trips
    },
    orderBy: {
      fechaInicio: "desc",
    },
    include: {
      vehiculo: true,
    },
  });

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto pb-20">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Mis Viajes</h1>
        <p className="text-muted-foreground">Historial de viajes realizados.</p>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No tienes viajes finalizados aún.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <Link href={`/mobile/trip/${trip.id}`} key={trip.id}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(trip.fechaInicio), "d MMM yyyy", {
                        locale: es,
                      })}
                    </div>
                    <Badge variant="secondary">FINALIZADO</Badge>
                  </div>

                  <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-green-600" />
                        <span className="font-medium">{trip.origen}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Navigation className="h-3 w-3 text-red-600" />
                        <span className="font-medium">{trip.destino}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {trip.vehiculo.placa} • {trip.distanciaTotal} km
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
