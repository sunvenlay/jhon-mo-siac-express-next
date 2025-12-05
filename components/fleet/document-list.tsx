"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  vehicles: any[]; // Using any for now to avoid complex type definitions, but should be typed properly
}

export function DocumentList({ vehicles }: DocumentListProps) {
  const getStatusColor = (date: Date) => {
    const today = new Date();
    const daysLeft = Math.ceil(
      (new Date(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return "bg-red-100 text-red-800 border-red-200"; // Expired
    if (daysLeft <= 30)
      return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Warning
    return "bg-green-100 text-green-800 border-green-200"; // Good
  };

  const getStatusIcon = (date: Date) => {
    const today = new Date();
    const daysLeft = Math.ceil(
      (new Date(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return <XCircle className="h-4 w-4 text-red-600" />;
    if (daysLeft <= 30)
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getDaysText = (date: Date) => {
    const today = new Date();
    const daysLeft = Math.ceil(
      (new Date(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return `Venció hace ${Math.abs(daysLeft)} días`;
    if (daysLeft === 0) return "Vence hoy";
    return `Vence en ${daysLeft} días`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>SOAT</TableHead>
            <TableHead>Certificado Circulación</TableHead>
            <TableHead>Conductor Asignado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">{vehicle.placa}</TableCell>
              <TableCell>
                {vehicle.soat ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(vehicle.soat.fechaCaducidad)}
                      <span className="font-medium">{vehicle.soat.numero}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit",
                        getStatusColor(vehicle.soat.fechaCaducidad)
                      )}
                    >
                      {getDaysText(vehicle.soat.fechaCaducidad)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(vehicle.soat.fechaCaducidad),
                        "d MMM yyyy",
                        { locale: es }
                      )}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">
                    No registrado
                  </span>
                )}
              </TableCell>
              <TableCell>
                {vehicle.certificado ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(vehicle.certificado.fechaCaducidad)}
                      <span className="font-medium">
                        {vehicle.certificado.numero}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit",
                        getStatusColor(vehicle.certificado.fechaCaducidad)
                      )}
                    >
                      {getDaysText(vehicle.certificado.fechaCaducidad)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(vehicle.certificado.fechaCaducidad),
                        "d MMM yyyy",
                        { locale: es }
                      )}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">
                    No registrado
                  </span>
                )}
              </TableCell>
              <TableCell>
                {vehicle.conductorActual ? (
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {vehicle.conductorActual.nombre}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {vehicle.conductorActual.dni || "S/D"}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
