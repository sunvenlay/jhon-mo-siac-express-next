"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useState } from "react"

// Fix for default marker icon in Next.js
const createIcon = () => {
    return L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })
}

interface Vehicle {
    id: string
    placa: string
    latitud: number
    longitud: number
    estado: string
}

interface FleetMapClientProps {
    vehicles: Vehicle[]
}

export default function FleetMapClient({ vehicles: initialVehicles }: FleetMapClientProps) {
    const [vehicles, setVehicles] = useState(initialVehicles)

    useEffect(() => {
        const interval = setInterval(() => {
            setVehicles(currentVehicles => 
                currentVehicles.map(v => ({
                    ...v,
                    latitud: v.latitud + (Math.random() - 0.5) * 0.001,
                    longitud: v.longitud + (Math.random() - 0.5) * 0.001,
                }))
            )
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return (
        <Card className="col-span-4 lg:col-span-4">
            <CardHeader className="px-6 py-4 border-b">
                <CardTitle>Mapa a Tiempo Real de la Flota</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <AspectRatio ratio={16 / 9}>
                    <MapContainer
                        center={[-12.0464, -77.0428]} // Lima, Peru
                        zoom={11}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {vehicles.map((vehicle) => (
                            <Marker 
                                key={vehicle.id} 
                                position={[vehicle.latitud, vehicle.longitud]} 
                                icon={createIcon()}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <p className="font-bold">{vehicle.placa}</p>
                                        <p>Estado: {vehicle.estado}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </AspectRatio>
            </CardContent>
        </Card>
    )
}
