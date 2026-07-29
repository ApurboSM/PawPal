import { useEffect } from "react";
import { LayersControl, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Brand pin. A divIcon keeps this to markup + CSS, which also sidesteps the
 * classic Leaflet-with-a-bundler problem of the default marker PNGs 404-ing.
 */
export const pawPinIcon = L.divIcon({
  className: "pawpal-pin",
  html: `
    <span class="pawpal-pin__pulse"></span>
    <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
      <path fill="hsl(340 82% 52%)" stroke="white" stroke-width="1.2"
        d="M12 22s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z" />
      <circle cx="12" cy="10.5" r="2.6" fill="white" />
    </svg>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});

/** The layer switcher: plain street map plus an aerial view for finding gates,
 *  driveways and building corners that the street map does not draw. */
export function BaseLayers() {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked name="Street">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      </LayersControl.BaseLayer>
      <LayersControl.BaseLayer name="Satellite">
        <TileLayer
          attribution="Tiles &copy; Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
      </LayersControl.BaseLayer>
      <LayersControl.BaseLayer name="Humanitarian">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles by HOT'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      </LayersControl.BaseLayer>
    </LayersControl>
  );
}

/** Glides the map to a new focus point whenever the caller changes it. */
export function FlyTo({
  center,
  zoom,
}: {
  center: { lat: number; lng: number } | null;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo([center.lat, center.lng], zoom ?? map.getZoom(), { duration: 0.8 });
  }, [map, center?.lat, center?.lng, zoom]);
  return null;
}

/**
 * Leaflet measures its container once. Inside a tab, dialog or grid that
 * settles after mount it needs telling again, or half the tiles stay grey.
 */
export function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    const timer = window.setTimeout(invalidate, 300);
    const observer = new ResizeObserver(invalidate);
    observer.observe(map.getContainer());
    window.addEventListener("resize", invalidate);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);
  return null;
}
