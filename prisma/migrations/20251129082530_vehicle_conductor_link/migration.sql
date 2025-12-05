-- AlterTable
ALTER TABLE "Vehiculo" ADD COLUMN     "conductorActualId" TEXT;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_conductorActualId_fkey" FOREIGN KEY ("conductorActualId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
