"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
    estimated: {
        label: "Costo Estimado",
        color: "hsl(var(--chart-1))",
    },
    actual: {
        label: "Costo Real",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

interface CostPredictionChartProps {
    data: {
        day: string
        estimated: number
        actual: number
    }[]
}

export function CostPredictionChart({ data }: CostPredictionChartProps) {
    // Calculate trend (simple comparison of last data point)
    const lastPoint = data[data.length - 1]
    const trend = lastPoint ? ((lastPoint.actual - lastPoint.estimated) / lastPoint.estimated) * 100 : 0
    const isOverrun = trend > 0

    return (
        <Card>
            <CardHeader>
                <CardTitle>Predicción de Costos con IA</CardTitle>
                <CardDescription>
                    Costo Estimado vs Costo Real (Últimos 30 días)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="actual"
                            type="natural"
                            fill="var(--color-actual)"
                            fillOpacity={0.4}
                            stroke="var(--color-actual)"
                            stackId="a"
                        />
                        <Area
                            dataKey="estimated"
                            type="natural"
                            fill="var(--color-estimated)"
                            fillOpacity={0.4}
                            stroke="var(--color-estimated)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            {isOverrun ? (
                                <>
                                    La IA predice un sobrecosto del {Math.abs(trend).toFixed(1)}% <TrendingUp className="h-4 w-4 text-red-500" />
                                </>
                            ) : (
                                <>
                                    Costos bajo control ({Math.abs(trend).toFixed(1)}% ahorro) <TrendingUp className="h-4 w-4 text-emerald-500" />
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Basado en datos históricos y predicciones recientes
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
