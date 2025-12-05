import "dotenv/config"
import { faker } from "@faker-js/faker"
import { hash } from "bcryptjs"
import {
  PrismaClient,
  EstadoVehiculo,
  Role,
  TipoGasto,
  type Usuario,
  type Vehiculo,
} from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DRIVER_COUNT = 5
const VEHICLE_COUNT = 5
const TRIP_COUNT = 50
const VEHICLE_TYPES = ["Camion 5T", "Camion 10T", "Furgoneta", "Trailer"]

type SeedDriver = Pick<Usuario, "id" | "nombre">
type SeedVehicle = Pick<Vehiculo, "id" | "kilometraje">

const uniqueValue = (generator: () => string, used: Set<string>) => {
  let candidate = generator()
  while (used.has(candidate)) {
    candidate = generator()
  }
  used.add(candidate)
  return candidate
}

async function main() {
  console.log("Start seeding...")

  await prisma.$transaction([
    prisma.gasto.deleteMany(),
    prisma.prediccionIA.deleteMany(),
    prisma.viaje.deleteMany(),
    prisma.soat.deleteMany(),
    prisma.certificadoCirculacion.deleteMany(),
    prisma.vehiculo.deleteMany(),
    prisma.notificacion.deleteMany(),
    prisma.usuario.deleteMany(),
  ])

  const sharedPasswordHash = await hash("Conductor123!", 10)
  const usedEmails = new Set<string>()
  const usedPlates = new Set<string>()

  const admin = await prisma.usuario.create({
    data: {
      nombre: "Administrador General",
      email: "admin@jhonmo.com",
      password: sharedPasswordHash,
      rol: Role.ADMIN,
    },
  })

  usedEmails.add(admin.email)
  console.log(`Created admin: ${admin.email}`)

  const drivers: SeedDriver[] = []
  for (let i = 0; i < DRIVER_COUNT; i++) {
    const email = uniqueValue(
      () => faker.internet.email({ provider: "jhonmo.com" }).toLowerCase(),
      usedEmails,
    )

    const driver = await prisma.usuario.create({
      data: {
        nombre: faker.person.fullName(),
        email,
        password: sharedPasswordHash,
        rol: Role.CONDUCTOR,
        dni: faker.string.numeric(8),
        brevete: faker.string.alphanumeric(9).toUpperCase(),
      },
      select: { id: true, nombre: true },
    })

    drivers.push(driver)
    console.log(`Created driver: ${driver.nombre}`)
  }

  const vehicles: SeedVehicle[] = []
  for (let i = 0; i < VEHICLE_COUNT; i++) {
    const placa = uniqueValue(() => faker.vehicle.vrm().toUpperCase(), usedPlates)
    const conductor = drivers[i % drivers.length]

    const vehicle = await prisma.vehiculo.create({
      data: {
        placa,
        modelo: faker.helpers.arrayElement(VEHICLE_TYPES),
        capacidad: faker.number.float({ min: 5, max: 30, fractionDigits: 1 }),
        kilometraje: faker.number.float({ min: 10000, max: 120000, fractionDigits: 1 }),
        estado: EstadoVehiculo.DISPONIBLE,
        latitud: faker.location.latitude({ min: -12.2, max: -11.9 }),
        longitud: faker.location.longitude({ min: -77.2, max: -76.9 }),
        conductorActualId: conductor.id,
        soat: {
            create: {
                numero: faker.string.numeric(10),
                fechaVigencia: faker.date.past(),
                fechaCaducidad: faker.date.future(),
            }
        },
        certificado: {
            create: {
                numero: faker.string.numeric(10),
                fechaVigencia: faker.date.past(),
                fechaCaducidad: faker.date.future(),
            }
        }
      },
      select: { id: true, kilometraje: true },
    })

    vehicles.push(vehicle)
    console.log(`Created vehicle: ${placa}`)
  }

  for (let i = 0; i < TRIP_COUNT; i++) {
    const driver = faker.helpers.arrayElement(drivers)
    const vehicleIndex = faker.number.int({ min: 0, max: vehicles.length - 1 })
    const vehicle = vehicles[vehicleIndex]

    const startDate = faker.date.recent({ days: 30 })
    const durationHours = faker.number.int({ min: 2, max: 48 })
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000)
    const kmInicial = Number(
      (vehicle.kilometraje + faker.number.float({ min: 0, max: 50, fractionDigits: 1 })).toFixed(1),
    )
    const distance = faker.number.float({ min: 50, max: 900, fractionDigits: 1 })
    const kmFinal = Number((kmInicial + distance).toFixed(1))
    vehicle.kilometraje = kmFinal

    const trip = await prisma.viaje.create({
      data: {
        origen: faker.location.city(),
        destino: faker.location.city(),
        fechaInicio: startDate,
        fechaFin: endDate,
        kmInicial,
        kmFinal,
        distanciaTotal: distance,
        conductorId: driver.id,
        vehiculoId: vehicle.id,
      },
    })

    await prisma.gasto.create({
      data: {
        tipo: TipoGasto.COMBUSTIBLE,
        monto: faker.number.float({ min: 100, max: 1200, fractionDigits: 2 }),
        descripcion: "Combustible diesel",
        fecha: startDate,
        viajeId: trip.id,
      },
    })

    if (faker.datatype.boolean({ probability: 0.6 })) {
      await prisma.gasto.create({
        data: {
          tipo: TipoGasto.PEAJE,
          monto: faker.number.float({ min: 10, max: 150, fractionDigits: 2 }),
          descripcion: "Peaje",
          fecha: new Date(startDate.getTime() + 60 * 60 * 1000),
          viajeId: trip.id,
        },
      })
    }

    if (faker.datatype.boolean({ probability: 0.3 })) {
      await prisma.gasto.create({
        data: {
          tipo: TipoGasto.MANTENIMIENTO,
          monto: faker.number.float({ min: 50, max: 400, fractionDigits: 2 }),
          descripcion: "Mantenimiento preventivo",
          fecha: endDate,
          viajeId: trip.id,
        },
      })
    }

    const estimatedCost = faker.number.float({ min: 150, max: 1500, fractionDigits: 2 })
    const isAnomaly = faker.datatype.boolean({ probability: 0.15 })

    await prisma.prediccionIA.create({
      data: {
        costoEstimado: estimatedCost,
        esAnomalo: isAnomaly,
        fechaPrediccion: startDate,
        viajeId: trip.id,
      },
    })
  }

  await Promise.all(
    vehicles.map((vehicle) =>
      prisma.vehiculo.update({
        where: { id: vehicle.id },
        data: {
          kilometraje: vehicle.kilometraje,
          estado: EstadoVehiculo.DISPONIBLE,
        },
      }),
    ),
  )

  console.log("Seeding finished.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
