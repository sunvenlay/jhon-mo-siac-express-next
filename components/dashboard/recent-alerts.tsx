import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLatestAnomalies } from "@/app/actions/ai"

export async function RecentAlerts() {
    const alerts = await getLatestAnomalies()

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Alertas Recientes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                {alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay anomalías detectadas.</p>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between space-x-4 rounded-md border p-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900">
                            <div className="flex items-center space-x-4">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none text-red-900 dark:text-red-200">
                                        Anomalía de Costo
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                        Vehículo {alert.viaje.vehiculo.placa} • {alert.fechaPrediccion.toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Est: S/{alert.costoEstimado.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
