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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Vehiculo, Viaje } from "@prisma/client"

// Schema for starting a trip
const startTripSchema = z.object({
    vehiculoId: z.string().min(1, "Seleccione un vehículo"),
    origen: z.string().min(3, "Ingrese el origen"),
    destino: z.string().min(3, "Ingrese el destino"),
    kmInicial: z.string().transform((v) => Number(v) || 0).pipe(z.number().min(0, "Kilometraje inválido")),
})

// Schema for ending a trip
const endTripSchema = z.object({
    kmFinal: z.string().transform((v) => Number(v) || 0).pipe(z.number().min(0, "Kilometraje inválido")),
})

interface TripFormProps {
    activeTrip: Viaje | null
    conductorId: string
    availableVehicles: Vehiculo[]
}

export function TripForm({ activeTrip, conductorId, availableVehicles }: TripFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const startForm = useForm<z.input<typeof startTripSchema>>({
        resolver: zodResolver(startTripSchema) as any,
        defaultValues: {
            vehiculoId: "",
            origen: "",
            destino: "",
            kmInicial: "0",
        },
    })

    const endForm = useForm<z.input<typeof endTripSchema>>({
        resolver: zodResolver(endTripSchema) as any,
        defaultValues: {
            kmFinal: String(activeTrip?.kmInicial || 0),
        },
    })

    async function onStartTrip(data: z.input<typeof startTripSchema>) {
        const values = data as unknown as z.output<typeof startTripSchema>
        setIsLoading(true)
        try {
            const response = await fetch("/api/viajes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...values, conductorId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al iniciar viaje")
            }

            toast.success("Viaje iniciado correctamente")
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error desconocido")
        } finally {
            setIsLoading(false)
        }
    }

    async function onEndTrip(data: z.input<typeof endTripSchema>) {
        const values = data as unknown as z.output<typeof endTripSchema>
        if (!activeTrip) return

        setIsLoading(true)
        try {
            const response = await fetch("/api/viajes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: activeTrip.id, kmFinal: values.kmFinal }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al finalizar viaje")
            }

            toast.success("Viaje finalizado correctamente")
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error desconocido")
        } finally {
            setIsLoading(false)
        }
    }

    if (activeTrip) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Viaje en Curso</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Origen: {activeTrip.origen} <br />
                        Destino: {activeTrip.destino} <br />
                        Km Inicial: {activeTrip.kmInicial}
                    </p>
                </div>

                <Form {...endForm}>
                    <form onSubmit={endForm.handleSubmit(onEndTrip)} className="space-y-4">
                        <FormField
                            control={endForm.control}
                            name="kmFinal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kilometraje Final</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" variant="destructive" disabled={isLoading}>
                            {isLoading ? "Finalizando..." : "Finalizar Viaje"}
                        </Button>
                    </form>
                </Form>
            </div>
        )
    }

    return (
        <Form {...startForm}>
            <form onSubmit={startForm.handleSubmit(onStartTrip)} className="space-y-4">
                <FormField
                    control={startForm.control}
                    name="vehiculoId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vehículo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione vehículo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableVehicles.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            {v.placa} - {v.modelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={startForm.control}
                        name="origen"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Origen</FormLabel>
                                <FormControl>
                                    <Input placeholder="Lima" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={startForm.control}
                        name="destino"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Destino</FormLabel>
                                <FormControl>
                                    <Input placeholder="Arequipa" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={startForm.control}
                    name="kmInicial"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kilometraje Inicial</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando..." : "Iniciar Viaje"}
                </Button>
            </form>
        </Form>
    )
}
