import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Vehiculo, Usuario } from "@prisma/client"

type VehiculoWithConductor = Vehiculo & {
    conductorActual: Pick<Usuario, "nombre"> | null
}

interface VehicleListProps {
    vehicles: VehiculoWithConductor[]
}

export function VehicleList({ vehicles }: VehicleListProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Capacidad</TableHead>
                        <TableHead>Kilometraje</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Conductor Actual</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vehicles.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No hay vehículos registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        vehicles.map((vehicle) => (
                            <TableRow key={vehicle.id}>
                                <TableCell className="font-medium">{vehicle.placa}</TableCell>
                                <TableCell>{vehicle.modelo}</TableCell>
                                <TableCell>{vehicle.capacidad} Ton</TableCell>
                                <TableCell>{vehicle.kilometraje} km</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            vehicle.estado === "DISPONIBLE"
                                                ? "default" // Was "success" but standard shadcn doesn't have it, using default (usually black/primary) or I can use custom class
                                                : vehicle.estado === "EN_RUTA"
                                                    ? "secondary"
                                                    : "destructive"
                                        }
                                        className={
                                            vehicle.estado === "DISPONIBLE" ? "bg-green-600 hover:bg-green-700" : ""
                                        }
                                    >
                                        {vehicle.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {vehicle.conductorActual?.nombre || "-"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
