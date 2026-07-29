import { useState } from "react";
import { MapContainer, Marker, Popup, ScaleControl } from "react-leaflet";
import { ExternalLink, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  BaseLayers,
  FlyTo,
  ResizeHandler,
  pawPinIcon,
} from "@/components/map/map-primitives";
import {
  formatCoords,
  formatLocation,
  getCurrentPosition,
  googleDirectionsUrl,
  googleMapsUrl,
  osmDirectionsUrl,
  toCoords,
  type AppointmentLocation,
} from "@/lib/maps";

interface LocationMapViewProps {
  location: AppointmentLocation;
  /** Tailwind height class for the map canvas. */
  heightClass?: string;
  className?: string;
}

/**
 * Read-only counterpart of the picker: what everyone else on an appointment
 * sees. The same two hand-offs — open in Google Maps, directions from where the
 * viewer is standing — live both in the marker popup and under the map.
 */
export function LocationMapView({
  location,
  heightClass = "h-[260px]",
  className = "",
}: LocationMapViewProps) {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const coords = toCoords(location);
  const label = formatLocation(location);

  if (!coords) {
    return (
      <div className={`rounded-xl border border-dashed p-4 text-sm text-neutral-500 ${className}`}>
        No location was pinned for this appointment.
      </div>
    );
  }

  const mapsHref = googleMapsUrl(coords);

  // Ask the browser where the viewer is so Google gets a real origin. If they
  // decline we still open directions and let Google use "Your location".
  const openDirections = async () => {
    setIsLocating(true);
    let origin = null;
    try {
      origin = await getCurrentPosition();
    } catch (error) {
      toast({
        title: "Using Google's location instead",
        description: (error as Error).message,
      });
    } finally {
      setIsLocating(false);
    }
    window.open(googleDirectionsUrl(coords, origin), "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className={`overflow-hidden rounded-xl border ${heightClass}`}>
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <BaseLayers />
          <ScaleControl position="bottomleft" />
          <ResizeHandler />
          <FlyTo center={coords} zoom={15} />
          <Marker position={[coords.lat, coords.lng]} icon={pawPinIcon}>
            <Popup>
              <div className="space-y-2">
                <p className="font-semibold">{label || "Appointment location"}</p>
                <p className="text-xs text-neutral-500">{formatCoords(coords)}</p>
                <div className="flex flex-col gap-1">
                  <a
                    className="font-medium text-[#4A6FA5] underline"
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps
                  </a>
                  <a
                    className="font-medium text-[#4A6FA5] underline"
                    href={googleDirectionsUrl(coords)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    See directions from your location
                  </a>
                  <a
                    className="text-neutral-500 underline"
                    href={osmDirectionsUrl(coords)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Directions on OpenStreetMap
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {label && <p className="text-sm text-neutral-600">{label}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a href={mapsHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Google Maps
          </a>
        </Button>
        <Button
          type="button"
          className="w-full bg-[#4A6FA5] hover:bg-[#3A5A87] sm:w-auto"
          onClick={openDirections}
          disabled={isLocating}
        >
          {isLocating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="mr-2 h-4 w-4" />
          )}
          Directions from your location
        </Button>
      </div>
    </div>
  );
}
