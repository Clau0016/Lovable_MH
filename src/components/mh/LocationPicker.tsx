import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const pin = L.divIcon({ className: "", html: '<span class="price-pin active">📍 Qui</span>', iconSize: [0, 0] });

function Sync({ lat, lng, onPick }: { lat: number; lng: number; onPick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], Math.max(map.getZoom(), 15)); }, [lat, lng, map]);
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}
export default function LocationPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  return (
    <MapContainer center={[lat, lng]} zoom={15} className="h-56 w-full rounded-2xl border border-border" scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={pin} draggable eventHandlers={{ dragend: (e) => { const p = (e.target as L.Marker).getLatLng(); onChange(p.lat, p.lng); } }} />
      <Sync lat={lat} lng={lng} onPick={onChange} />
    </MapContainer>
  );
}
