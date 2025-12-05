"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { finalizeTrip } from "@/app/actions/trip-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FinalizeTripButtonProps {
  tripId: string;
}

export function FinalizeTripButton({ tripId }: FinalizeTripButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFinalize = async () => {
    try {
      setIsLoading(true);
      const result = await finalizeTrip(tripId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Viaje finalizado correctamente");
        router.push("/mobile/home");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      className="w-full mt-4"
      size="lg"
      onClick={handleFinalize}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Finalizando...
        </>
      ) : (
        "Finalizar Viaje"
      )}
    </Button>
  );
}
