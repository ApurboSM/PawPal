import type { Pet } from "@pawpal/shared/schema";

const GENERIC_PET_NAME_REGEX = /^pet\s+\d+$/i;

const NAME_BANK: Record<string, string[]> = {
  dog: ["Buddy", "Max", "Charlie", "Rocky", "Cooper", "Leo", "Toby", "Milo"],
  cat: ["Luna", "Bella", "Nala", "Coco", "Simba", "Mochi", "Willow", "Daisy"],
  rabbit: ["Thumper", "Clover", "Hazel", "Snowy", "Peanut", "Maple", "Binky", "Poppy"],
  bird: ["Sunny", "Rio", "Kiwi", "Skye", "Pico", "Blue", "Mango", "Coco"],
  hamster: ["Nibbles", "Pip", "Oreo", "Pebble", "Biscuit", "Bean", "Toffee", "Mimi"],
  other: ["Nova", "Lucky", "Pepper", "Ginger", "Ash", "Scout", "Honey", "Ziggy"],
  default: ["Paws", "Bailey", "Misty", "Ruby", "Remy", "Shadow", "Rosie", "Finn"],
};

export function getPetDisplayName(pet: Pick<Pet, "id" | "name" | "species">): string {
  const rawName = (pet.name ?? "").trim();

  if (rawName && !GENERIC_PET_NAME_REGEX.test(rawName)) {
    return rawName;
  }

  const bank = NAME_BANK[pet.species?.toLowerCase()] ?? NAME_BANK.default;
  const stableIndex = Math.abs((pet.id ?? 1) - 1) % bank.length;
  return bank[stableIndex];
}
