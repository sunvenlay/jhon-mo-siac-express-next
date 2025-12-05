"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { predictCost } from "@/app/actions/ai"
import { toast } from "sonner"
import { Loader2, Calculator } from "lucide-react"

const formSchema = z.object({
    distancia_km: z.string().transform((v) => Number(v) || 0).pipe(z.number().min(1, "La distancia debe ser mayor a 0")),
    tipo_vehiculo: z.string().min(1, "Seleccione un tipo de vehículo"),
    peajes_estimados: z.string().transform((v) => Number(v) || 0).pipe(z.number().min(0, "El peaje no puede ser negativo")),
})

export function TripSimulator() {
    const [isLoading, setIsLoading] = useState(false)
    const [prediction, setPrediction] = useState<number | null>(null)

    const form = useForm<z.input<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            distancia_km: "",
            tipo_vehiculo: "1",
            peajes_estimados: "0",
        },
    })

    async function onSubmit(data: z.input<typeof formSchema>) {
        const values = data as unknown as z.output<typeof formSchema>
        setIsLoading(true)
        setPrediction(null)

        try {
            const result = await predictCost({
                distancia_km: values.distancia_km,
                tipo_vehiculo: Number(values.tipo_vehiculo),
                peajes_estimados: values.peajes_estimados,
            })

            if (result) {
                setPrediction(result.costo_estimado)
                toast.success("Cálculo completado")
            } else {
                toast.error("No se pudo conectar con el servicio de IA")
            }
        } catch (error) {
            toast.error("Error al realizar la predicción")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Simulador de Costos IA
                </CardTitle>
                <CardDescription>
                    Estima el costo de un viaje antes de asignarlo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="distancia_km"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Distancia (km)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" placeholder="Ej: 250" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tipo_vehiculo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Vehículo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">Camión 5T</SelectItem>
                                            <SelectItem value="2">Camión 10T</SelectItem>
                                            <SelectItem value="3">Furgoneta</SelectItem>
                                            <SelectItem value="4">Trailer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="peajes_estimados"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Peajes Estimados (S/)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" placeholder="Ej: 60" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Calculando...
                                </>
                            ) : (
                                "Calcular Costo Estimado"
                            )}
                        </Button>
                    </form>
                </Form>

                {prediction !== null && (
                    <div className="mt-6 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
                        <p className="text-sm font-medium text-muted-foreground">Costo Estimado por IA</p>
                        <p className="text-3xl font-bold text-primary">S/ {prediction.toFixed(2)}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
