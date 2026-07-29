import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
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
  /** What the dropdown shows — may carry a flag emoji. */
  label: string;
  /** The plain name that gets saved on the appointment. */
  name: string;
  lat?: string | null;
  lng?: string | null;
}

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
        <Command>
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

/**
 * Country → state → city → street address, with a Leaflet map beside them.
 * The dropdowns move the map, and the map fills in the address, so the two
 * halves stay in step whichever one the user starts from.
 */
export function LocationPickerFields({ value, onChange, errors }: LocationPickerFieldsProps) {
  const [mapFocus, setMapFocus] = useState<LatLng | null>(null);

  const { data: countries, isLoading: isCountriesLoading } = useQuery<GeoCountry[]>({
    queryKey: ["/api/geo/countries"],
    staleTime: Infinity,
  });

  const { data: states, isLoading: isStatesLoading } = useQuery<GeoState[]>({
    queryKey: [`/api/geo/states/${value.countryCode}`],
    enabled: Boolean(value.countryCode),
    staleTime: Infinity,
  });

  const { data: cities, isLoading: isCitiesLoading } = useQuery<GeoCity[]>({
    queryKey: [`/api/geo/cities/${value.countryCode}/${value.stateCode}`],
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
        lat: city.latitude,
        lng: city.longitude,
      })),
    [cities],
  );

  // Some countries (city-states, small islands) have exactly one state. Picking
  // it for the user saves a dropdown that can only be answered one way.
  useEffect(() => {
    if (value.stateCode || stateOptions.length !== 1) return;
    const only = stateOptions[0];
    onChange({ ...value, state: only.name, stateCode: only.value, city: "" });
    const center = toLatLng(only.lat, only.lng);
    if (center) setMapFocus(center);
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
    const center = toLatLng(option.lat, option.lng);
    if (center) setMapFocus(center);
  };

  const selectState = (option: Option) => {
    onChange({ ...value, state: option.name, stateCode: option.value, city: "" });
    const center = toLatLng(option.lat, option.lng);
    if (center) setMapFocus(center);
  };

  const selectCity = (option: Option) => {
    onChange({ ...value, city: option.name });
    const center = toLatLng(option.lat, option.lng);
    if (center) setMapFocus(center);
  };

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
            emptyText="No country found"
            isLoading={isCountriesLoading}
            onSelect={selectCountry}
          />
          {errors?.countryCode && <p className="text-sm text-red-600">{errors.countryCode}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-state">State / Division</Label>
          <SearchableSelect
            id="location-state"
            options={stateOptions}
            value={value.stateCode}
            placeholder={value.countryCode ? "Select a state or division" : "Pick a country first"}
            emptyText="No state or division found"
            disabled={!value.countryCode}
            isLoading={isStatesLoading}
            onSelect={selectState}
          />
          {errors?.stateCode && <p className="text-sm text-red-600">{errors.stateCode}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-city">City</Label>
          <SearchableSelect
            id="location-city"
            options={cityOptions}
            value={value.city}
            placeholder={value.stateCode ? "Select a city" : "Pick a state first"}
            emptyText="No city found — pin the spot on the map instead"
            disabled={!value.stateCode}
            isLoading={isCitiesLoading}
            onSelect={selectCity}
          />
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
