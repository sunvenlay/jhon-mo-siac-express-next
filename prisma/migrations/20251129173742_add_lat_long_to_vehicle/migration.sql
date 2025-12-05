/*
  Warnings:

  - You are about to drop the column `conductorActualId` on the `Vehiculo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vehiculo" DROP CONSTRAINT "Vehiculo_conductorActualId_fkey";

-- DropIndex
DROP INDEX "Gasto_viajeId_idx";

-- AlterTable
ALTER TABLE "Vehiculo" DROP COLUMN "conductorActualId";
