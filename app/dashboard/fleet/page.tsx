import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { VehicleList } from "@/components/fleet/vehicle-list";
import { DriverList } from "@/components/fleet/driver-list";
import { DocumentList } from "@/components/fleet/document-list";
import { FleetActions } from "@/components/fleet/fleet-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Gestión de Flota | Jhon Mo S.A.C.",
  description: "Administración de vehículos y conductores",
};

export const dynamic = "force-dynamic";

export default async function FleetPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const defaultTab = searchParams.tab === "drivers" ? "drivers" : "vehicles";

  const [vehicles, drivers] = await Promise.all([
    prisma.vehiculo.findMany({
      include: {
        conductorActual: { select: { nombre: true, dni: true } },
        soat: true,
        certificado: true,
      },
      orderBy: { placa: "asc" },
    }),
    prisma.usuario.findMany({
      where: { rol: "CONDUCTOR" },
      select: {
        id: true,
        nombre: true,
        email: true,
        dni: true,
        brevete: true,
        creadoEn: true,
      },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Flota</h2>
        <FleetActions drivers={drivers} />
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">
            Vehículos ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="drivers">
            Conductores ({drivers.length})
          </TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehículos</CardTitle>
              <CardDescription>
                Listado de todos los vehículos de la flota y su estado actual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleList vehicles={vehicles} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conductores</CardTitle>
              <CardDescription>
                Listado de conductores registrados en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DriverList drivers={drivers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Documentos</CardTitle>
              <CardDescription>
                Monitoreo de vencimientos de SOAT y Certificados de Circulación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList vehicles={vehicles} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
