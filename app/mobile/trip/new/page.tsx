"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/app/actions/auth";
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
import { Truck, MapPin, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  vehiculoId: z.string().min(1, "Seleccione un vehículo"),
  origen: z.string().min(1, "Ingrese el origen"),
  destino: z.string().min(1, "Ingrese el destino"),
  kmInicial: z
    .string()
    .transform((v) => Number(v) || 0)
    .pipe(z.number().min(1, "Ingrese kilometraje válido")),
});

// Mock data - in real app fetch from API
const vehicles = [
  { id: "v1", placa: "ABC-123", modelo: "Volvo FH16" },
  { id: "v2", placa: "XYZ-789", modelo: "Scania R500" },
];

export default function NewTripPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<
    { id: string; placa: string; modelo: string }[]
  >([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/vehiculos");
        if (res.ok) {
          const data = await res.json();
          // Filter only available vehicles
          const availableVehicles = data.data.filter(
            (v: any) => v.estado === "DISPONIBLE"
          );
          setVehicles(availableVehicles);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Error al cargar vehículos");
      }
    };
    fetchVehicles();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehiculoId: "",
      origen: "Lima",
      destino: "",
      kmInicial: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Get current user
      const user = await getSessionUser();
      if (!user) {
        toast.error(
          "No se pudo identificar al conductor. Inicie sesión nuevamente."
        );
        return;
      }

      const payload = {
        conductorId: user.id,
        vehiculoId: values.vehiculoId,
        origen: values.origen,
        destino: values.destino,
        kmInicial: Number(values.kmInicial),
      };

      const res = await fetch("/api/viajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar el viaje");
      }

      toast.success("Viaje iniciado correctamente");
      router.push(`/mobile/trip/${data.data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Iniciar Viaje</h1>
        <p className="text-muted-foreground">
          Complete los datos para comenzar la ruta.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="vehiculoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículo Asignado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione vehículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No hay vehículos disponibles
                          </SelectItem>
                        ) : (
                          vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.placa} - {v.modelo}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origen</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destino</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Navigation className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="Ciudad"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="kmInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odómetro Inicial (Km)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Iniciando..."
                ) : (
                  <span className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Comenzar Ruta
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
