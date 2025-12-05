"use client"


import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


interface Trip {
    id: string
    origen: string
    destino: string
    fechaInicio: string
    fechaFin: string | null
    conductor: {
        nombre: string
    }
    vehiculo: {
        placa: string
    }
    gastos: {
        monto: number
    }[]
}

interface RecentTripsTableProps {
    trips: Trip[]
}

export function RecentTripsTable({ trips }: RecentTripsTableProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Últimos Viajes</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Origen</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead>Conductor</TableHead>
                            <TableHead>Vehículo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Costo Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {trips.map((trip) => {
                            const totalCost = trip.gastos.reduce((acc, curr) => acc + curr.monto, 0)
                            const status = trip.fechaFin ? "Completado" : "En Ruta"

                            return (
                                <TableRow key={trip.id}>
                                    <TableCell className="font-medium">{trip.origen}</TableCell>
                                    <TableCell>{trip.destino}</TableCell>
                                    <TableCell>{trip.conductor.nombre}</TableCell>
                                    <TableCell>{trip.vehiculo.placa}</TableCell>
                                    <TableCell>
                                        <Badge variant={status === "Completado" ? "secondary" : "default"}>
                                            {status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        S/ {totalCost.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
