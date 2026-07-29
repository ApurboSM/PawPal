// Helpers shared by the appointment location picker and the read-only map cards.
// Everything here is key-free: OpenStreetMap tiles, Nominatim for geocoding and
// plain Google Maps URL schemes for the hand-off buttons.

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeoCountry {
  name: string;
  isoCode: string;
  flag: string;
  phonecode: string;
  latitude: string | null;
  longitude: string | null;
}

export interface GeoState {
  name: string;
  isoCode: string;
  latitude: string | null;
  longitude: string | null;
}

export interface GeoCity {
  name: string;
  latitude: string | null;
  longitude: string | null;
}

export interface PlaceResult {
  label: string;
  lat: number;
  lng: number;
}

/** A saved appointment location, as stored on the appointment row. */
export interface AppointmentLocation {
  locationCountry?: string | null;
  locationState?: string | null;
  locationCity?: string | null;
  locationAddress?: string | null;
  locationLat?: string | null;
  locationLng?: string | null;
}

export const toCoords = (location: AppointmentLocation): LatLng | null => {
  const lat = Number(location.locationLat);
  const lng = Number(location.locationLng);
  if (!location.locationLat || !location.locationLng) return null;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

/** "12 Green Rd, Dhaka, Dhaka Division, Bangladesh" — for labels and map popups. */
export const formatLocation = (location: AppointmentLocation): string =>
  [
    location.locationAddress,
    location.locationCity,
    location.locationState,
    location.locationCountry,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

export const formatCoords = ({ lat, lng }: LatLng): string =>
  `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

/** Drops the viewer straight onto the pin in Google Maps. */
export const googleMapsUrl = ({ lat, lng }: LatLng): string =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/**
 * Directions to the pin. With no origin Google fills in "Your location" itself,
 * which also covers the case where the browser denies geolocation.
 */
export const googleDirectionsUrl = (destination: LatLng, origin?: LatLng | null): string => {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });
  if (origin) params.set("origin", `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

/** OpenStreetMap's own directions page — the no-Google fallback. */
export const osmDirectionsUrl = (destination: LatLng, origin?: LatLng | null): string => {
  const from = origin ? `${origin.lat},${origin.lng}` : "";
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${from};${destination.lat},${destination.lng}`;
};

const NOMINATIM = "https://nominatim.openstreetmap.org";

/** Free-text place search for the map's search box. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  if (query.trim().length < 3) return [];
  const url = `${NOMINATIM}/search?format=jsonv2&addressdetails=0&limit=6&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Place search is unavailable right now");
  const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
  return data.map((item) => ({
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));
}

/** Turns a pinned point into a street address so the user does not have to type it. */
export async function reverseGeocode(
  { lat, lng }: LatLng,
  signal?: AbortSignal,
): Promise<{ address: string; display: string } | null> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    display_name?: string;
    address?: Record<string, string>;
  };
  if (!data.display_name) return null;

  const a = data.address ?? {};
  // Keep the street-level part only: country/state/city already have their own
  // dropdowns, so repeating them in the address box reads as noise.
  const address = [
    [a.house_number, a.road].filter(Boolean).join(" "),
    a.neighbourhood ?? a.suburb ?? a.quarter,
    a.postcode,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  return { address: address || data.display_name, display: data.display_name };
}

/** Browser geolocation as a promise, with a message the UI can show as-is. */
export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Your browser does not support location sharing"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? "Location permission was denied. Pin the spot manually instead."
              : "Could not read your location. Pin the spot manually instead.",
          ),
        ),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}
