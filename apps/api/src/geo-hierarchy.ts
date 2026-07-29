import { City, State } from "country-state-city";

/**
 * Sub-national hierarchy for countries where the country-state-city dataset
 * flattens two administrative tiers into one "states" list.
 *
 * Bangladesh is the case that matters here: the dataset returns 8 divisions and
 * 62 districts side by side, so the State dropdown showed "Dhaka Division" and
 * "Dhaka District" as siblings — and picking a division yielded no cities at
 * all, because the dataset only attaches cities to district codes.
 *
 * The table below is the official ISO 3166-2:BD assignment of each district to
 * its division. It also repairs two dataset defects:
 *   - code 33 is Manikganj, not "Bahadia" (a union inside that district)
 *   - Magura (37) and Narsingdi (42) are missing from the dataset entirely
 */

export interface GeoPlace {
  name: string;
  isoCode: string;
  latitude: string | null;
  longitude: string | null;
}

interface DistrictSeed {
  code: string;
  /** Used when the dataset has no row, or the row's name is wrong. */
  name: string;
  division: string;
  /** Only needed for districts the dataset does not carry. */
  latitude?: string;
  longitude?: string;
}

const BD_DIVISION_CODES = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

const BD_DISTRICTS: DistrictSeed[] = [
  { code: "02", name: "Barguna District", division: "A" },
  { code: "06", name: "Barisal District", division: "A" },
  { code: "07", name: "Bhola District", division: "A" },
  { code: "25", name: "Jhalokati District", division: "A" },
  { code: "50", name: "Pirojpur District", division: "A" },
  { code: "51", name: "Patuakhali District", division: "A" },

  { code: "01", name: "Bandarban District", division: "B" },
  { code: "04", name: "Brahmanbaria District", division: "B" },
  { code: "08", name: "Comilla District", division: "B" },
  { code: "09", name: "Chandpur District", division: "B" },
  { code: "10", name: "Chittagong District", division: "B" },
  { code: "11", name: "Cox's Bazar District", division: "B" },
  { code: "16", name: "Feni District", division: "B" },
  { code: "29", name: "Khagrachari District", division: "B" },
  { code: "31", name: "Lakshmipur District", division: "B" },
  { code: "47", name: "Noakhali District", division: "B" },
  { code: "56", name: "Rangamati Hill District", division: "B" },

  { code: "13", name: "Dhaka District", division: "C" },
  { code: "15", name: "Faridpur District", division: "C" },
  { code: "17", name: "Gopalganj District", division: "C" },
  { code: "18", name: "Gazipur District", division: "C" },
  { code: "26", name: "Kishoreganj District", division: "C" },
  // The dataset calls this one "Bahadia"; ISO 3166-2:BD calls it Manikganj.
  { code: "33", name: "Manikganj District", division: "C" },
  { code: "35", name: "Munshiganj District", division: "C" },
  { code: "36", name: "Madaripur District", division: "C" },
  { code: "40", name: "Narayanganj District", division: "C" },
  { code: "42", name: "Narsingdi District", division: "C", latitude: "23.93220000", longitude: "90.71500000" },
  { code: "53", name: "Rajbari District", division: "C" },
  { code: "62", name: "Shariatpur District", division: "C" },
  { code: "63", name: "Tangail District", division: "C" },

  { code: "05", name: "Bagerhat District", division: "D" },
  { code: "12", name: "Chuadanga District", division: "D" },
  { code: "22", name: "Jessore District", division: "D" },
  { code: "23", name: "Jhenaidah District", division: "D" },
  { code: "27", name: "Khulna District", division: "D" },
  { code: "30", name: "Kushtia District", division: "D" },
  { code: "37", name: "Magura District", division: "D", latitude: "23.48550000", longitude: "89.41980000" },
  { code: "39", name: "Meherpur District", division: "D" },
  { code: "43", name: "Narail District", division: "D" },
  { code: "58", name: "Satkhira District", division: "D" },

  { code: "03", name: "Bogra District", division: "E" },
  { code: "24", name: "Joypurhat District", division: "E" },
  { code: "44", name: "Natore District", division: "E" },
  { code: "45", name: "Chapai Nawabganj District", division: "E" },
  { code: "48", name: "Naogaon District", division: "E" },
  { code: "49", name: "Pabna District", division: "E" },
  { code: "54", name: "Rajshahi District", division: "E" },
  { code: "59", name: "Sirajganj District", division: "E" },

  { code: "14", name: "Dinajpur District", division: "F" },
  { code: "19", name: "Gaibandha District", division: "F" },
  { code: "28", name: "Kurigram District", division: "F" },
  { code: "32", name: "Lalmonirhat District", division: "F" },
  { code: "46", name: "Nilphamari District", division: "F" },
  { code: "52", name: "Panchagarh District", division: "F" },
  { code: "55", name: "Rangpur District", division: "F" },
  { code: "64", name: "Thakurgaon District", division: "F" },

  { code: "20", name: "Habiganj District", division: "G" },
  { code: "38", name: "Moulvibazar District", division: "G" },
  { code: "60", name: "Sylhet District", division: "G" },
  { code: "61", name: "Sunamganj District", division: "G" },

  { code: "21", name: "Jamalpur District", division: "H" },
  { code: "34", name: "Mymensingh District", division: "H" },
  { code: "41", name: "Netrokona District", division: "H" },
  { code: "57", name: "Sherpur District", division: "H" },
];

const HIERARCHIES: Record<string, { topLevelCodes: readonly string[]; children: DistrictSeed[] }> = {
  BD: { topLevelCodes: BD_DIVISION_CODES, children: BD_DISTRICTS },
};

export const hasHierarchy = (countryCode: string) =>
  Boolean(HIERARCHIES[countryCode.toUpperCase()]);

/** The tier shown in the "State / Division" dropdown. */
export function getTopLevelStates(countryCode: string): GeoPlace[] {
  const country = countryCode.toUpperCase();
  const hierarchy = HIERARCHIES[country];
  const states = State.getStatesOfCountry(country);

  if (!hierarchy) {
    return states.map(({ name, isoCode, latitude, longitude }) => ({
      name,
      isoCode,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    }));
  }

  return states
    .filter((state) => hierarchy.topLevelCodes.includes(state.isoCode))
    .map(({ name, isoCode, latitude, longitude }) => ({
      name,
      isoCode,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    }));
}

/**
 * The "City / District" options for one selected state.
 *
 * Under a division this returns its districts *plus* whatever cities the dataset
 * knows inside them, so the user can go as fine-grained as the data allows and
 * never lands on an empty list.
 */
export function getPlacesInState(countryCode: string, stateCode: string): GeoPlace[] {
  const country = countryCode.toUpperCase();
  const hierarchy = HIERARCHIES[country];
  const isTopLevel = hierarchy?.topLevelCodes.includes(stateCode);

  const cityPlaces = (code: string): GeoPlace[] =>
    City.getCitiesOfState(country, code).map((city) => ({
      name: city.name,
      isoCode: "",
      latitude: city.latitude ?? null,
      longitude: city.longitude ?? null,
    }));

  if (!hierarchy || !isTopLevel) {
    return cityPlaces(stateCode);
  }

  const datasetStates = new Map(State.getStatesOfCountry(country).map((s) => [s.isoCode, s]));
  const districts = hierarchy.children.filter((district) => district.division === stateCode);

  const places: GeoPlace[] = [];
  for (const district of districts) {
    const fromDataset = datasetStates.get(district.code);
    places.push({
      name: district.name,
      isoCode: district.code,
      latitude: district.latitude ?? fromDataset?.latitude ?? null,
      longitude: district.longitude ?? fromDataset?.longitude ?? null,
    });
    places.push(...cityPlaces(district.code));
  }
  // A few countries file cities directly under the top level too.
  places.push(...cityPlaces(stateCode));

  // Districts are pushed before their cities, so keeping the first of each name
  // means a duplicate resolves to the district entry.
  const seen = new Set<string>();
  return places
    .filter((place) => {
      const key = place.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
