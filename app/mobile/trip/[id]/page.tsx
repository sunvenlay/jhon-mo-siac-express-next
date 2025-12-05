import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Truck,
  DollarSign,
  Plus,
  ChevronLeft,
} from "lucide-react";
import FleetMapWrapper from "@/components/dashboard/fleet-map-wrapper";
import { FinalizeTripButton } from "@/components/mobile/finalize-trip-button";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const viaje = await prisma.viaje.findUnique({
    where: { id },
    include: {
      vehiculo: true,
      conductor: true,
      gastos: {
        orderBy: { fecha: "desc" },
      },
    },
  });

  if (!viaje) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-xl font-bold text-red-500">Viaje no encontrado</h1>
        <Link href="/mobile/home">
          <Button variant="link">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const totalGastos = viaje.gastos.reduce((acc, curr) => acc + curr.monto, 0);

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto pb-20">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/mobile/home">
              <Button variant="ghost" size="icon" className="-ml-2">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              Detalle de Viaje
            </h1>
          </div>
          <Badge variant={viaje.fechaFin ? "secondary" : "default"}>
            {viaje.fechaFin ? "FINALIZADO" : "EN CURSO"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          ID: {viaje.id.slice(0, 8)}...
        </p>
      </div>

      {/* Map Section */}
      <Card className="overflow-hidden">
        <div className="h-48 w-full bg-muted relative">
          {/* We pass a single vehicle to the map wrapper to show its location */}
          {/* In a real app, we'd pass the trip route or current location */}
          <FleetMapWrapper
            vehicles={[
              {
                id: viaje.vehiculo.id,
                placa: viaje.vehiculo.placa,
                latitud: -12.0464, // Mock location
                longitud: -77.0428, // Mock location
                estado: viaje.vehiculo.estado,
              },
            ]}
          />
        </div>
        <CardContent className="pt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Origen
            </span>
            <p className="font-medium text-sm">{viaje.origen}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Navigation className="h-3 w-3" /> Destino
            </span>
            <p className="font-medium text-sm">{viaje.destino}</p>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Truck className="h-4 w-4" /> Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold">{viaje.vehiculo.placa}</p>
              <p className="text-sm text-muted-foreground">
                {viaje.vehiculo.modelo}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Km Inicial</p>
              <p className="text-sm text-muted-foreground">
                {viaje.kmInicial} km
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Gastos
          </h2>
          <Link href={`/mobile/expense?viajeId=${viaje.id}`}>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Nuevo Gasto
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-medium">Total Gastado</span>
              <span className="text-lg font-bold text-green-600">
                S/ {totalGastos.toFixed(2)}
              </span>
            </div>

            {viaje.gastos.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No hay gastos registrados
              </p>
            ) : (
              <div className="space-y-4">
                {viaje.gastos.map((gasto) => (
                  <div
                    key={gasto.id}
                    className="flex justify-between items-start text-sm"
                  >
                    <div>
                      <p className="font-medium">{gasto.tipo}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(gasto.fecha), "d MMM, HH:mm", {
                          locale: es,
                        })}
                      </p>
                      {gasto.descripcion && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {gasto.descripcion}
                        </p>
                      )}
                    </div>
                    <span className="font-medium">
                      S/ {gasto.monto.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {!viaje.fechaFin && <FinalizeTripButton tripId={viaje.id} />}
    </div>
  );
}
