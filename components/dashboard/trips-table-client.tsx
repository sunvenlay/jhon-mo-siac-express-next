"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileDown, MapPin } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TripData {
    id: string
    fecha: Date
    placa: string
    origen: string
    destino: string
    costoEstimado: number
    costoReal: number
    estado: string
}

interface TripsTableClientProps {
    trips: TripData[]
}

export function TripsTableClient({ trips }: TripsTableClientProps) {
    const exportPDF = () => {
        const doc = new jsPDF()
        
        doc.setFontSize(18)
        doc.text("Reporte de Viajes - Jhon Mo S.A.C.", 14, 22)
        doc.setFontSize(11)
        doc.text(`Fecha de reporte: ${new Date().toLocaleDateString()}`, 14, 30)

        const tableData = trips.map(trip => [
            trip.fecha.toLocaleDateString(),
            trip.placa,
            `${trip.origen} -> ${trip.destino}`,
            `S/ ${trip.costoEstimado.toFixed(2)}`,
            `S/ ${trip.costoReal.toFixed(2)}`,
            trip.estado
        ])

        autoTable(doc, {
            head: [["Fecha", "Placa", "Ruta", "Est. IA", "Real", "Estado"]],
            body: tableData,
            startY: 40,
        })

        doc.save("reporte-viajes.pdf")
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Historial de Viajes</CardTitle>
                <Button onClick={exportPDF} variant="outline" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Exportar PDF
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Vehículo</TableHead>
                            <TableHead>Ruta</TableHead>
                            <TableHead className="text-right">Costo IA</TableHead>
                            <TableHead className="text-right">Costo Real</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {trips.map((trip) => {
                            const isOverrun = trip.costoReal > trip.costoEstimado * 1.15
                            
                            return (
                                <TableRow key={trip.id} className={isOverrun ? "bg-red-50 dark:bg-red-900/10" : ""}>
                                    <TableCell>{trip.fecha.toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{trip.placa}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <span className="text-foreground">{trip.origen}</span>
                                            <MapPin className="h-3 w-3" />
                                            <span className="text-foreground">{trip.destino}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">S/ {trip.costoEstimado.toFixed(2)}</TableCell>
                                    <TableCell className={`text-right font-bold ${isOverrun ? "text-red-600" : ""}`}>
                                        S/ {trip.costoReal.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={trip.estado === "COMPLETADO" ? "default" : "secondary"}>
                                            {trip.estado}
                                        </Badge>
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
