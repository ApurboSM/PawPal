import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LocationMapPicker } from "@/components/map/location-map-picker";
import type { GeoCity, GeoCountry, GeoState, LatLng } from "@/lib/maps";

/** One appointment location, as held by the booking form. */
export interface LocationValue {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  address: string;
  lat: string;
  lng: string;
}

export const emptyLocation: LocationValue = {
  country: "",
  countryCode: "",
  state: "",
  stateCode: "",
  city: "",
  address: "",
  lat: "",
  lng: "",
};

interface Option {
  value: string;
  /** Present when the entry is an administrative district, not a city. */
  code?: string;
  /** What the dropdown shows — may carry a flag emoji. */
  label: string;
  /** The plain name that gets saved on the appointment. */
  name: string;
  lat?: string | null;
  lng?: string | null;
}

/**
 * Place names in the dataset carry their native diacritics — "Bājitpur",
 * "Dohār", "Sonārgaon" — but nobody types them on the way to picking a city.
 */
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/**
 * cmdk's built-in scorer matches the raw string, so "Bajitpur" never finds
 * "Bājitpur". Score the stripped forms instead, ranking a name that starts with
 * the query above one that merely contains it.
 */
const scoreOption = (value: string, search: string) => {
  const query = normalize(search).trim();
  if (!query) return 1;

  const name = normalize(value);
  const at = name.indexOf(query);
  if (at < 0) return 0;
  if (at === 0) return 1;
  // "bazar" should still surface "Bhairab Bāzār", just below any leading match.
  return name[at - 1] === " " ? 0.7 : 0.4;
};

/**
 * Type-ahead dropdown. A plain <select> is unusable at 250 countries or the
 * 1000+ cities some states have, so every list here is searchable.
 */
function SearchableSelect({
  options,
  value,
  placeholder,
  emptyText,
  disabled,
  isLoading,
  onSelect,
  id,
}: {
  options: Option[];
  value: string;
  placeholder: string;
  emptyText: string;
  disabled?: boolean;
  isLoading?: boolean;
  onSelect: (option: Option) => void;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {isLoading ? "Loading…" : selected?.label ?? placeholder}
          </span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command filter={scoreOption}>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const toLatLng = (lat?: string | null, lng?: string | null): LatLng | null => {
  if (!lat || !lng) return null;
  const parsed = { lat: Number(lat), lng: Number(lng) };
  return Number.isNaN(parsed.lat) || Number.isNaN(parsed.lng) ? null : parsed;
};

interface LocationPickerFieldsProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  /** Field-level messages, keyed by the LocationValue key they belong to. */
  errors?: Partial<Record<keyof LocationValue, string | undefined>>;
}

/** How tight the map frames each tier of the picker. */
const FOCUS_ZOOM = { country: 5, state: 8, district: 11, city: 13 } as const;

/**
 * Bump when the geo endpoints start answering differently. The old responses
 * went out with a 24-hour `Cache-Control`, so a browser that asked for a
 * division's districts before they existed would keep showing that empty list
 * for the rest of the day; a new URL retires those entries at once.
 */
const GEO_VERSION = 2;

/**
 * Country → state/division → city/district → street address, with a Leaflet map
 * beside them. The dropdowns move the map, and the map fills in the address, so
 * the two halves stay in step whichever one the user starts from.
 */
export function LocationPickerFields({ value, onChange, errors }: LocationPickerFieldsProps) {
  const [mapFocus, setMapFocus] = useState<LatLng | null>(null);
  const [focusZoom, setFocusZoom] = useState<number>(FOCUS_ZOOM.city);

  const {
    data: countries,
    isLoading: isCountriesLoading,
    isError: countriesFailed,
    refetch: refetchCountries,
  } = useQuery<GeoCountry[]>({
    queryKey: [`/api/geo/countries?v=${GEO_VERSION}`],
    staleTime: Infinity,
  });

  const {
    data: states,
    isLoading: isStatesLoading,
    isError: statesFailed,
    refetch: refetchStates,
  } = useQuery<GeoState[]>({
    queryKey: [`/api/geo/states/${value.countryCode}?v=${GEO_VERSION}`],
    enabled: Boolean(value.countryCode),
    staleTime: Infinity,
  });

  const {
    data: cities,
    isLoading: isCitiesLoading,
    isError: citiesFailed,
    refetch: refetchCities,
  } = useQuery<GeoCity[]>({
    queryKey: [`/api/geo/cities/${value.countryCode}/${value.stateCode}?v=${GEO_VERSION}`],
    enabled: Boolean(value.countryCode && value.stateCode),
    staleTime: Infinity,
  });

  const countryOptions = useMemo<Option[]>(
    () =>
      (countries ?? []).map((country) => ({
        value: country.isoCode,
        label: `${country.flag ? `${country.flag} ` : ""}${country.name}`,
        name: country.name,
        lat: country.latitude,
        lng: country.longitude,
      })),
    [countries],
  );

  const stateOptions = useMemo<Option[]>(
    () =>
      (states ?? []).map((state) => ({
        value: state.isoCode,
        label: state.name,
        name: state.name,
        lat: state.latitude,
        lng: state.longitude,
      })),
    [states],
  );

  const cityOptions = useMemo<Option[]>(
    () =>
      (cities ?? []).map((city) => ({
        value: city.name,
        label: city.name,
        name: city.name,
        code: city.isoCode,
        lat: city.latitude,
        lng: city.longitude,
      })),
    [cities],
  );

  const focusOn = (option: Option, zoom: number) => {
    const center = toLatLng(option.lat, option.lng);
    if (!center) return;
    setMapFocus(center);
    setFocusZoom(zoom);
  };

  // Some countries (city-states, small islands) have exactly one state. Picking
  // it for the user saves a dropdown that can only be answered one way.
  useEffect(() => {
    if (value.stateCode || stateOptions.length !== 1) return;
    const only = stateOptions[0];
    onChange({ ...value, state: only.name, stateCode: only.value, city: "" });
    focusOn(only, FOCUS_ZOOM.state);
  }, [stateOptions, value.stateCode]);

  const pinned = toLatLng(value.lat, value.lng);

  const selectCountry = (option: Option) => {
    onChange({
      ...value,
      country: option.name,
      countryCode: option.value,
      state: "",
      stateCode: "",
      city: "",
    });
    focusOn(option, FOCUS_ZOOM.country);
  };

  const selectState = (option: Option) => {
    onChange({ ...value, state: option.name, stateCode: option.value, city: "" });
    focusOn(option, FOCUS_ZOOM.state);
  };

  const selectCity = (option: Option) => {
    onChange({ ...value, city: option.name });
    // District entries carry an ISO code; they cover far more ground than a city.
    focusOn(option, option.code ? FOCUS_ZOOM.district : FOCUS_ZOOM.city);
  };

  /** A dead request must not masquerade as an empty result set. */
  const LoadFailed = ({ what, onRetry }: { what: string; onRetry: () => void }) => (
    <p className="flex flex-wrap items-center gap-2 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      Could not load {what}. Check that the server is running.
      <button type="button" onClick={onRetry} className="font-semibold underline">
        Retry
      </button>
    </p>
  );

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* Dropdowns */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location-country">Country</Label>
          <SearchableSelect
            id="location-country"
            options={countryOptions}
            value={value.countryCode}
            placeholder="Select a country"
            emptyText={countriesFailed ? "Country list unavailable" : "No country found"}
            isLoading={isCountriesLoading}
            onSelect={selectCountry}
          />
          {countriesFailed && <LoadFailed what="countries" onRetry={() => refetchCountries()} />}
          {errors?.countryCode && <p className="text-sm text-red-600">{errors.countryCode}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-state">State / Division</Label>
          <SearchableSelect
            id="location-state"
            options={stateOptions}
            value={value.stateCode}
            placeholder={value.countryCode ? "Select a state or division" : "Pick a country first"}
            emptyText={statesFailed ? "List unavailable" : "No state or division found"}
            disabled={!value.countryCode}
            isLoading={isStatesLoading}
            onSelect={selectState}
          />
          {statesFailed && (
            <LoadFailed what="states and divisions" onRetry={() => refetchStates()} />
          )}
          {errors?.stateCode && <p className="text-sm text-red-600">{errors.stateCode}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-city">City / District</Label>
          <SearchableSelect
            id="location-city"
            options={cityOptions}
            value={value.city}
            placeholder={
              value.stateCode ? "Select a city or district" : "Pick a state or division first"
            }
            emptyText={
              citiesFailed
                ? "List unavailable — pin the spot on the map instead"
                : "Nothing found — pin the spot on the map instead"
            }
            disabled={!value.stateCode}
            isLoading={isCitiesLoading}
            onSelect={selectCity}
          />
          {citiesFailed && (
            <LoadFailed what="cities and districts" onRetry={() => refetchCities()} />
          )}
          {errors?.city && <p className="text-sm text-red-600">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-address">Address</Label>
          <Input
            id="location-address"
            value={value.address}
            placeholder="Write your address"
            onChange={(event) => onChange({ ...value, address: event.target.value })}
          />
          <p className="text-xs text-neutral-500">
            House, road, area and any landmark that helps someone find you.
          </p>
          {errors?.address && <p className="text-sm text-red-600">{errors.address}</p>}
        </div>

        <div className="rounded-lg bg-neutral-50 p-3 text-sm">
          <p className="flex items-center gap-2 font-medium text-neutral-700">
            <MapPin className="h-4 w-4 text-[#FF6B98]" />
            {pinned ? "Exact spot pinned" : "No exact spot pinned yet"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {pinned
              ? "Everyone on this appointment can open it in Google Maps or get directions from where they are."
              : "Use the map to pin the exact gate or entrance — that pin is what other users navigate to."}
          </p>
          {(errors?.lat || errors?.lng) && (
            <p className="mt-1 text-sm text-red-600">{errors.lat ?? errors.lng}</p>
          )}
        </div>
      </div>

      {/* Map */}
      <div>
        <LocationMapPicker
          value={pinned}
          focus={mapFocus}
          focusZoom={focusZoom}
          onChange={(next) =>
            onChange({ ...value, lat: String(next.lat), lng: String(next.lng) })
          }
          onAddressResolved={(address) => {
            // Never overwrite what the user typed — only fill the gap.
            if (!value.address.trim()) onChange({ ...value, address });
          }}
        />
      </div>
    </div>
  );
}
