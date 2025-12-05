"use server"

const AI_API_URL = process.env.AI_API_URL || "http://127.0.0.1:8000"

export interface PredictCostInput {
  distancia_km: number
  tipo_vehiculo: number
  peajes_estimados: number
}

export interface PredictCostOutput {
  costo_estimado: number
}

export interface DetectAnomalyInput {
  costo_real: number
  costo_estimado_ia: number
  distancia_km: number
}

export interface DetectAnomalyOutput {
  es_anomalia: boolean
  mensaje: string
}

export async function predictCost(data: PredictCostInput): Promise<PredictCostOutput | null> {
  try {
    const response = await fetch(`${AI_API_URL}/predict_cost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Error calling AI predict_cost:", await response.text())
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Network error calling AI predict_cost:", error)
    return null
  }
}

export async function detectAnomaly(data: DetectAnomalyInput): Promise<DetectAnomalyOutput | null> {
  try {
    const response = await fetch(`${AI_API_URL}/detect_anomaly`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Error calling AI detect_anomaly:", await response.text())
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Network error calling AI detect_anomaly:", error)
    return null
  }
}

import { prisma } from "@/lib/prisma"

export async function getLatestAnomalies() {
  try {
    const anomalies = await prisma.prediccionIA.findMany({
      where: { esAnomalo: true },
      take: 5,
      orderBy: { fechaPrediccion: "desc" },
      include: {
        viaje: {
          include: {
            vehiculo: true,
          },
        },
      },
    })
    return anomalies
  } catch (error) {
    console.error("Error fetching anomalies:", error)
    return []
  }
}
