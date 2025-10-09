export type Princess = {
  commonName: string; // Pony notation
  oldName: string; // Unicorn notation
  titles: Array<string>; // Aliases
};

// Schema for storage in the json database.
export type PrincessMap = Map<string, Array<Princess>>;

// Default values to initialize database state.
export const KnownPrincesses: PrincessMap = new Map([
  [
    "elder",
    [
      {
        commonName: "Celestia",
        oldName: "Celestia",
        titles: ["Princess of the Day", "Daybreaker"],
      },
      {
        commonName: "Luna",
        oldName: "Luna",
        titles: ["Princess of the Night", "Nightmare Moon"],
      },
      {
        commonName: "Cadance",
        oldName: "Mi Amore Cadenza",
        titles: ["Princess of Love", "Crystal Empress"],
      },
    ],
  ],
  [
    "young",
    [
      {
        commonName: "Sparkle",
        oldName: "Twilight Sparkle",
        titles: ["Princess of Friendship", "Element of Magic"],
      },
      {
        commonName: "Sunset",
        oldName: "Shimmer Sunset",
        titles: ["Demoness of Fire", "Element of Empathy"],
      },
      {
        commonName: "Fallenstar",
        oldName: "Starfall Fading",
        titles: ["Princess of Destruction", "Godhunter"],
      },
    ],
  ],
]);
