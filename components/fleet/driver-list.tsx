import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Usuario } from "@prisma/client";

interface DriverListProps {
  drivers: Pick<
    Usuario,
    "id" | "nombre" | "email" | "dni" | "brevete" | "creadoEn"
  >[];
}

export function DriverList({ drivers }: DriverListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Brevete</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Fecha Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No hay conductores registrados.
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">{driver.nombre}</TableCell>
                <TableCell>{driver.dni || "-"}</TableCell>
                <TableCell>{driver.brevete || "-"}</TableCell>
                <TableCell>{driver.email}</TableCell>
                <TableCell>
                  {new Date(driver.creadoEn).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
