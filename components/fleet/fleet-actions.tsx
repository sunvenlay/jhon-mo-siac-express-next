"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, UserPlus } from "lucide-react";
import { AddVehicleForm } from "./add-vehicle-form";
import { AddDriverForm } from "./add-driver-form";

export function FleetActions({
  drivers,
}: {
  drivers: { id: string; nombre: string }[];
}) {
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Dialog open={vehicleOpen} onOpenChange={setVehicleOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Vehículo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
            <DialogDescription>
              Ingrese los datos del vehículo para registrarlo en la flota.
            </DialogDescription>
          </DialogHeader>
          <AddVehicleForm
            onSuccess={() => setVehicleOpen(false)}
            drivers={drivers}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={driverOpen} onOpenChange={setDriverOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Registrar Conductor
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Conductor</DialogTitle>
            <DialogDescription>
              Cree una cuenta para un nuevo conductor.
            </DialogDescription>
          </DialogHeader>
          <AddDriverForm onSuccess={() => setDriverOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
