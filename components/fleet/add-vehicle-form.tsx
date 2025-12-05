"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  placa: z.string().min(6, "La placa debe tener al menos 6 caracteres"),
  modelo: z.string().min(2, "El modelo es obligatorio"),
  capacidad: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "La capacidad debe ser mayor a 0",
    }),
  kilometraje: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El kilometraje no puede ser negativo",
    }),
  estado: z.enum(["DISPONIBLE", "EN_RUTA", "MANTENIMIENTO"]),
  conductorActualId: z.string().optional(),
  soat: z
    .object({
      numero: z.string().min(1, "El número de SOAT es obligatorio"),
      fechaVigencia: z.string().min(1, "La fecha de vigencia es obligatoria"),
      fechaCaducidad: z.string().min(1, "La fecha de caducidad es obligatoria"),
    })
    .optional(),
  certificado: z
    .object({
      numero: z.string().min(1, "El número de Certificado es obligatorio"),
      fechaVigencia: z.string().min(1, "La fecha de vigencia es obligatoria"),
      fechaCaducidad: z.string().min(1, "La fecha de caducidad es obligatoria"),
    })
    .optional(),
});

export function AddVehicleForm({
  onSuccess,
  drivers,
}: {
  onSuccess?: () => void;
  drivers: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placa: "",
      modelo: "",
      capacidad: "0",
      kilometraje: "0",
      estado: "DISPONIBLE",
      conductorActualId: "none",
      soat: {
        numero: "",
        fechaVigencia: "",
        fechaCaducidad: "",
      },
      certificado: {
        numero: "",
        fechaVigencia: "",
        fechaCaducidad: "",
      },
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Transform "none" to undefined for conductorActualId
      const conductorId =
        data.conductorActualId === "none" ? undefined : data.conductorActualId;

      const payload = {
        ...data,
        capacidad: Number(data.capacidad),
        kilometraje: Number(data.kilometraje),
        conductorActualId: conductorId,
      };

      const response = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Error al registrar el vehículo");
      }

      toast.success("Vehículo registrado correctamente");
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="placa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa</FormLabel>
                <FormControl>
                  <Input placeholder="ABC-123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Toyota Hilux" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="capacidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad (Ton)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kilometraje"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilometraje</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                    <SelectItem value="EN_RUTA">En Ruta</SelectItem>
                    <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="conductorActualId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conductor Asignado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione conductor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-4" />
        <h4 className="font-medium">SOAT</h4>
        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="soat.numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="N° SOAT" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="soat.fechaVigencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vigencia</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="soat.fechaCaducidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caducidad</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-4" />
        <h4 className="font-medium">Certificado de Circulación</h4>
        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="certificado.numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="N° Certificado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="certificado.fechaVigencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vigencia</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="certificado.fechaCaducidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caducidad</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar Vehículo"}
        </Button>
      </form>
    </Form>
  );
}
