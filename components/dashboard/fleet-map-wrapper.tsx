"use client"

import dynamic from "next/dynamic"

const FleetMapClient = dynamic(() => import("./fleet-map-client"), { 
    ssr: false,
    loading: () => <div className="w-full h-full min-h-[400px] bg-muted animate-pulse rounded-lg" />
})

interface Vehicle {
    id: string
    placa: string
    latitud: number
    longitud: number
    estado: string
}

interface FleetMapWrapperProps {
    vehicles: Vehicle[]
}

export default function FleetMapWrapper({ vehicles }: FleetMapWrapperProps) {
    return <FleetMapClient vehicles={vehicles} />
}
