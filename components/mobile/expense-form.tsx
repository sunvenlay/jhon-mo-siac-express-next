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
import { Fuel, Camera } from "lucide-react";

const formSchema = z.object({
  vehiculoId: z.string().min(1, "Seleccione un vehículo"),
  tipo: z.enum(["COMBUSTIBLE", "MANTENIMIENTO", "PEAJE", "VIATICO", "OTROS"]),
  monto: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "El monto debe ser un número mayor a 0",
  }),
  galones: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Los galones deben ser un número positivo",
    }),
  descripcion: z.string().optional(),
  imagenUrl: z.string().optional(),
});

interface ExpenseFormProps {
  vehicles: {
    id: string;
    placa: string;
    modelo: string;
  }[];
  viajeId?: string;
}

export function ExpenseForm({ vehicles, viajeId }: ExpenseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehiculoId: "",
      tipo: "COMBUSTIBLE",
      monto: "",
      galones: "",
      descripcion: "",
      imagenUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        monto: Number(values.monto),
        galones: values.galones ? Number(values.galones) : undefined,
        viajeId: viajeId,
      };

      const response = await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Error al registrar gasto");
      }

      toast.success("Gasto registrado correctamente");
      form.reset();
      setPreviewUrl(null);

      if (viajeId) {
        router.push(`/mobile/trip/${viajeId}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("imagenUrl", url);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
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
                  {vehicles.map((v) => (
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
                  <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                  <SelectItem value="PEAJE">Peaje</SelectItem>
                  <SelectItem value="VIATICO">Viático</SelectItem>
                  <SelectItem value="OTROS">Otros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="monto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto (S/)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      S/
                    </span>
                    <Input
                      type="number"
                      step="0.1"
                      className="pl-9"
                      placeholder="0.00"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="galones"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Galones (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nota (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Grifo Primax" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Foto del Voucher</FormLabel>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="voucher-upload"
                onChange={handleImageSelect}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  document.getElementById("voucher-upload")?.click()
                }
              >
                <Camera className="mr-2 h-4 w-4" />
                {previewUrl ? "Cambiar Foto" : "Tomar Foto / Subir"}
              </Button>
            </div>

            {previewUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Voucher preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            * La imagen se guardará localmente para esta demostración.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            "Registrando..."
          ) : (
            <span className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Registrar Gasto
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
}
