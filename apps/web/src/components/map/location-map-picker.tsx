import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, ScaleControl, useMapEvents } from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import {
  Crosshair,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  BaseLayers,
  FlyTo,
  ResizeHandler,
  pawPinIcon,
} from "@/components/map/map-primitives";
import {
  formatCoords,
  getCurrentPosition,
  googleDirectionsUrl,
  googleMapsUrl,
  reverseGeocode,
  searchPlaces,
  type LatLng,
  type PlaceResult,
} from "@/lib/maps";

interface LocationMapPickerProps {
  value: LatLng | null;
  onChange: (next: LatLng) => void;
  /** Where the dropdowns say we should be looking — recentres the map. */
  focus?: LatLng | null;
  /** How tight to zoom when following `focus`. A country needs a wider frame
   *  than a city, so the caller picks it. */
  focusZoom?: number;
  /** Fires after a pin lands and the address behind it is resolved. */
  onAddressResolved?: (address: string, display: string) => void;
  heightClass?: string;
}

/** Click anywhere to drop or move the pin. */
function ClickToPin({ onPick }: { onPick: (next: LatLng) => void }) {
  useMapEvents({
    click: (event) => onPick({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });
  return null;
}

export function LocationMapPicker({
  value,
  onChange,
  focus,
  focusZoom = 12,
  onAddressResolved,
  heightClass = "h-[320px] sm:h-[380px]",
}: LocationMapPickerProps) {
  const { toast } = useToast();
  const markerRef = useRef<LeafletMarker | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null);
  const [flyZoom, setFlyZoom] = useState(16);
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(null);

  // Dhaka: a defined starting view beats the empty ocean at [0, 0].
  const initialCenter = useMemo<LatLng>(
    () => value ?? focus ?? { lat: 23.8103, lng: 90.4125 },
    // Only the first render matters here; later moves go through FlyTo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Follow the country/state/city dropdowns.
  useEffect(() => {
    if (!focus) return;
    setFlyTarget(focus);
    setFlyZoom(focusZoom);
  }, [focus?.lat, focus?.lng, focusZoom]);

  const pin = useCallback(
    (next: LatLng) => {
      onChange(next);
      setFlyTarget(next);
      // A dropped pin is an exact spot, so go all the way in.
      setFlyZoom(16);
    },
    [onChange],
  );

  // Debounced place search. Nominatim asks for at most one call per second, so
  // the timer is generous and every superseded request is aborted.
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        setResults(await searchPlaces(query, controller.signal));
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 600);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  // Name the pinned point, and hand the street part back to the address field.
  useEffect(() => {
    if (!value) {
      setResolvedLabel(null);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsResolving(true);
      try {
        const result = await reverseGeocode(value, controller.signal);
        if (result) {
          setResolvedLabel(result.display);
          onAddressResolved?.(result.address, result.display);
        }
      } catch {
        // A missing label is cosmetic; the coordinates are what get saved.
      } finally {
        setIsResolving(false);
      }
    }, 500);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value?.lat, value?.lng]);

  const useMyLocation = async () => {
    setIsLocating(true);
    try {
      pin(await getCurrentPosition());
    } catch (error) {
      toast({
        title: "Could not get your location",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a place, landmark or area"
          className="pl-9 pr-9"
          aria-label="Search the map"
        />
        {(isSearching || query) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            ) : (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </span>
        )}

        {results.length > 0 && (
          <ul className="absolute z-[1000] mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white shadow-lg">
            {results.map((result) => (
              <li key={`${result.lat}-${result.lng}-${result.label}`}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-100"
                  onClick={() => {
                    pin({ lat: result.lat, lng: result.lng });
                    setQuery("");
                    setResults([]);
                  }}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B98]" />
                  <span>{result.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className={`overflow-hidden rounded-xl border ${heightClass}`}>
        <MapContainer
          center={[initialCenter.lat, initialCenter.lng]}
          zoom={value ? 16 : 11}
          scrollWheelZoom
          className="h-full w-full"
        >
          <BaseLayers />
          <ScaleControl position="bottomleft" />
          <ResizeHandler />
          <FlyTo center={flyTarget} zoom={flyZoom} />
          <ClickToPin onPick={pin} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pawPinIcon}
              draggable
              autoPan
              ref={markerRef}
              eventHandlers={{
                dragend: () => {
                  const next = markerRef.current?.getLatLng();
                  if (next) onChange({ lat: next.lat, lng: next.lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation} disabled={isLocating}>
          {isLocating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="mr-2 h-4 w-4" />
          )}
          Use my current location
        </Button>
        {value && (
          <>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={googleMapsUrl(value)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Google Maps
              </a>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={googleDirectionsUrl(value)} target="_blank" rel="noopener noreferrer">
                <Navigation className="mr-2 h-4 w-4" />
                Directions from your location
              </a>
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        {value ? (
          <>
            Pinned at <span className="font-medium text-neutral-700">{formatCoords(value)}</span>
            {isResolving && " · looking up the address…"}
            {resolvedLabel && !isResolving && ` · ${resolvedLabel}`}
          </>
        ) : (
          "Tap the map to drop a pin, then drag it for the exact spot. Zoom, satellite view and search all work here."
        )}
      </p>
    </div>
  );
}
