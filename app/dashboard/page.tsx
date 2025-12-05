import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { FleetMap } from "@/components/dashboard/fleet-map";
import { CostPredictionChart } from "@/components/dashboard/cost-chart";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import { RecentTripsTable } from "@/components/dashboard/recent-trips-table";
import { TripSimulator } from "@/components/dashboard/trip-simulator";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Fetch data
  const [
    activeVehiclesCount,
    totalVehiclesCount,
    expenses,
    anomaliesCount,
    trips,
    predictions,
  ] = await Promise.all([
    prisma.vehiculo.count({ where: { estado: "EN_RUTA" } }),
    prisma.vehiculo.count(),
    prisma.gasto.findMany({
      where: {
        fecha: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.prediccionIA.count({ where: { esAnomalo: true } }),
    prisma.viaje.findMany({
      take: 5,
      orderBy: { fechaInicio: "desc" },
      include: {
        conductor: true,
        vehiculo: true,
        gastos: true,
      },
    }),
    prisma.prediccionIA.findMany({
      where: {
        fechaPrediccion: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        },
      },
      include: {
        viaje: {
          include: {
            gastos: true,
          },
        },
      },
      orderBy: { fechaPrediccion: "asc" },
    }),
  ]);

  const totalCost = expenses.reduce((acc, curr) => acc + curr.monto, 0);
  const fleetUtilization =
    totalVehiclesCount > 0
      ? (activeVehiclesCount / totalVehiclesCount) * 100
      : 0;

  // Transform trips for the table (dates to strings)
  const formattedTrips = trips.map((trip) => ({
    ...trip,
    fechaInicio: trip.fechaInicio.toISOString(),
    fechaFin: trip.fechaFin ? trip.fechaFin.toISOString() : null,
  }));

  // Prepare Chart Data
  // Group by day
  const chartDataMap = new Map<string, { estimated: number; actual: number }>();

  predictions.forEach((p) => {
    const day = p.fechaPrediccion.toISOString().split("T")[0].slice(8, 10); // Get DD
    const current = chartDataMap.get(day) || { estimated: 0, actual: 0 };

    // Sum estimated costs
    current.estimated += p.costoEstimado;

    // Sum actual costs (from associated trip expenses)
    const actualCost = p.viaje.gastos.reduce((sum, g) => sum + g.monto, 0);
    current.actual += actualCost;

    chartDataMap.set(day, current);
  });

  // Convert map to array and sort
  const chartData = Array.from(chartDataMap.entries())
    .map(([day, values]) => ({ day, ...values }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-1 pt-4">
          <MetricsCards
            activeVehiclesCount={activeVehiclesCount}
            totalCost={totalCost}
            anomaliesCount={anomaliesCount}
            fleetUtilization={fleetUtilization}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <FleetMap />
          </div>
          <div className="col-span-3">
            <TripSimulator />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <CostPredictionChart data={chartData} />
          </div>
          <div className="col-span-3">
            <RecentAlerts />
          </div>
        </div>
        <RecentTripsTable trips={formattedTrips} />
      </div>
    </>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
