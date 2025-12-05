import { ExpenseForm } from "@/components/mobile/expense-form";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ viajeId?: string }>;
}) {
  const { viajeId } = await searchParams;
  const vehicles = await prisma.vehiculo.findMany({
    select: {
      id: true,
      placa: true,
      modelo: true,
    },
  });

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Registrar Gasto</h1>
        <p className="text-muted-foreground">
          Reporte de combustible y viáticos.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ExpenseForm vehicles={vehicles} viajeId={viajeId} />
        </CardContent>
      </Card>
    </div>
  );
}
