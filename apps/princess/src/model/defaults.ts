import { Category } from "./category.js";
import { Princess } from "./princess.js";

/** @returns the starting set, elder and young; new instances on every call. */
export function defaultCategories(): Category[] {
  return [
    new Category("elder", [
      Princess.of({
        commonName: "Celestia",
        oldName: "Celestia",
        titles: ["Princess of the Day", "Daybreaker"],
      }),
      Princess.of({
        commonName: "Luna",
        oldName: "Luna",
        titles: ["Princess of the Night", "Nightmare Moon"],
      }),
      Princess.of({
        commonName: "Cadance",
        oldName: "Mi Amore Cadenza",
        titles: ["Princess of Love", "Crystal Empress"],
      }),
    ]),
    new Category("young", [
      Princess.of({
        commonName: "Sparkle",
        oldName: "Twilight Sparkle",
        titles: ["Princess of Friendship", "Element of Magic"],
      }),
      Princess.of({
        commonName: "Sunset",
        oldName: "Sunset Shimmer",
        titles: ["Demoness of Fire", "Element of Empathy"],
      }),
      Princess.of({
        commonName: "Fallenstar",
        oldName: "Starfall Fading",
        titles: ["Princess of Destruction", "Godhunter"],
      }),
    ]),
  ];
}
