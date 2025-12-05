import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, DollarSign, Truck } from "lucide-react"

interface MetricsCardsProps {
    activeVehiclesCount: number
    totalCost: number
    anomaliesCount: number
    fleetUtilization: number
}

export function MetricsCards({ activeVehiclesCount, totalCost, anomaliesCount, fleetUtilization }: MetricsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Vehicles
                    </CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeVehiclesCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-0">
                            {fleetUtilization.toFixed(0)}% Fleet Utilized
                        </Badge>
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Monthly Cost
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">S/ {totalCost.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <Badge variant="secondary" className="bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-0">
                            Current Month
                        </Badge>
                    </p>
                </CardContent>
            </Card>

            <Card className="border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.15)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-600">
                        AI Anomalies Detected
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-700">{anomaliesCount} Critical</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Requires immediate attention
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
