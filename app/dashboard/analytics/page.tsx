import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analítica IA | Jhon Mo S.A.C.",
  description: "Insights y reportes generados por Inteligencia Artificial",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  // Fetch data for Driver Efficiency
  const trips = await prisma.viaje.findMany({
    include: {
      conductor: true,
      gastos: true,
    },
  });

  const driverStats = new Map<
    string,
    { name: string; distance: number; fuelCost: number }
  >();

  trips.forEach((trip) => {
    const driverId = trip.conductorId;
    const current = driverStats.get(driverId) || {
      name: trip.conductor.nombre,
      distance: 0,
      fuelCost: 0,
    };

    current.distance += trip.distanciaTotal || 0;

    const fuelExpenses = trip.gastos
      .filter((g) => g.tipo === "COMBUSTIBLE")
      .reduce((sum, g) => sum + g.monto, 0);

    current.fuelCost += fuelExpenses;

    driverStats.set(driverId, current);
  });

  const driverEfficiency = Array.from(driverStats.values())
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 10); // Top 10 drivers

  // Fetch data for Anomaly Trend
  const anomalies = await prisma.prediccionIA.findMany({
    where: {
      esAnomalo: true,
      fechaPrediccion: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
      },
    },
    orderBy: { fechaPrediccion: "asc" },
  });

  const anomalyMap = new Map<string, number>();

  anomalies.forEach((a) => {
    const date = a.fechaPrediccion.toISOString().split("T")[0].slice(5); // MM-DD
    anomalyMap.set(date, (anomalyMap.get(date) || 0) + 1);
  });

  const anomalyTrend = Array.from(anomalyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Fetch data for Cost Prediction
  const predictions = await prisma.prediccionIA.findMany({
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
  });

  // Prepare Chart Data
  const chartDataMap = new Map<string, { estimated: number; actual: number }>();

  predictions.forEach((p) => {
    const day = p.fechaPrediccion.toISOString().split("T")[0].slice(8, 10); // Get DD
    const current = chartDataMap.get(day) || { estimated: 0, actual: 0 };

    current.estimated += p.costoEstimado;

    const actualCost = p.viaje.gastos.reduce((sum, g) => sum + g.monto, 0);
    current.actual += actualCost;

    chartDataMap.set(day, current);
  });

  const costPredictions = Array.from(chartDataMap.entries())
    .map(([day, values]) => ({ day, ...values }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Analítica Avanzada
        </h2>
      </div>
      <AnalyticsCharts
        driverEfficiency={driverEfficiency}
        anomalyTrend={anomalyTrend}
        costPredictions={costPredictions}
      />
    </div>
  );
}
