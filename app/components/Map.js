"use client";

import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { useMap, useMapEvents } from "react-leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default function Map({ mock, position, setPosition, selectedIssue }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const lat = parseFloat(searchParams.get("lat")) || 19.8;
  const lng = parseFloat(searchParams.get("lng")) || 75.33;

  const [isClient, setIsClient] = useState(false);
  let center = selectedIssue ? selectedIssue.coords : { lat, lng };

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    import("@/leadlet.config");
  }, []);

  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          // Update URL without scrolling
          router.push(`${pathname}?lat=${newPos.lat}&lng=${newPos.lng}`, { scroll: false });
        }
      },
    }),
    [router, pathname]
  );

  if (!isClient) return <p className="text-center text-gray-500">Loading map...</p>;

  return (
    <MapContainer
      className="w-full h-full md:h-full md:w-full z-0"
      center={center}
      zoom={14}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker 
        draggable={!selectedIssue} // Only draggable if not viewing a specific issue
        eventHandlers={eventHandlers}
        position={center}
        ref={markerRef}
      >
        <Popup>
          {!selectedIssue 
            ? "Drag me to set exact location!" 
            : "Report Location"}
        </Popup>
      </Marker>
      <Centering position={center} />
      <OnClick />
    </MapContainer>
  );
}

function Centering({ position }) {
  const map = useMap();
  map.setView([position.lat, position.lng]);
  return null;
}

function OnClick() {
  const pathname = usePathname();
  const router = useRouter();
  useMapEvents({
    click: (e) => {
      // If we are on the report page, clicking the map moves the marker
      if (pathname.includes("/report")) {
        router.push(`${pathname}?lat=${e.latlng.lat}&lng=${e.latlng.lng}`, { scroll: false });
      }
    },
  });
  return null;
}
