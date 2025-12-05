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

const formSchema = z.object({
    tipo: z.enum(["COMBUSTIBLE", "PEAJE", "MANTENIMIENTO", "OTROS"]),
    monto: z.string().transform((v) => Number(v) || 0).pipe(z.number().min(0.1, "El monto debe ser mayor a 0")),
    descripcion: z.string().optional(),
})

interface ExpenseFormProps {
    viajeId: string
}

export function ExpenseForm({ viajeId }: ExpenseFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.input<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            tipo: "COMBUSTIBLE",
            monto: "0",
            descripcion: "",
        },
    })

    async function onSubmit(data: z.input<typeof formSchema>) {
        const values = data as unknown as z.output<typeof formSchema>
        setIsLoading(true)
        try {
            const response = await fetch("/api/gastos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...values, viajeId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al registrar gasto")
            }

            toast.success("Gasto registrado correctamente")
            form.reset()
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error desconocido")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Gasto</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione tipo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="COMBUSTIBLE">Combustible</SelectItem>
                                    <SelectItem value="PEAJE">Peaje</SelectItem>
                                    <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                                    <SelectItem value="OTROS">Otros</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto (S/)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Detalles adicionales..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" variant="secondary" disabled={isLoading}>
                    {isLoading ? "Registrando..." : "Registrar Gasto"}
                </Button>
            </form>
        </Form>
    )
}
