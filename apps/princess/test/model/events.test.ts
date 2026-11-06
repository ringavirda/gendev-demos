import { describe, expect, it } from "vitest";
import { defaultCategories } from "../../src/model/defaults.js";
import { describeEvent } from "../../src/model/events.js";
import { Princess } from "../../src/model/princess.js";

describe("describeEvent", () => {
  it("describes each event", () => {
    const princess = (commonName: string) => Princess.of({ commonName });
    expect(
      describeEvent({
        type: "added",
        category: "young",
        princess: princess("Moonlight"),
      }),
    ).toBe("added Moonlight to young");
    expect(
      describeEvent({
        type: "removed",
        category: "young",
        princess: princess("Sunset"),
      }),
    ).toBe("removed Sunset from young");
    expect(
      describeEvent({
        type: "changed",
        category: "young",
        princess: princess("Sparkle"),
      }),
    ).toBe("changed Sparkle in young");
  });
});

describe("defaultCategories", () => {
  it("defaults are the current set with Sunset Shimmer", () => {
    const [elder, young] = defaultCategories();
    expect(elder.princesses.map(String)).toEqual([
      "Celestia",
      "Luna",
      "Cadance",
    ]);
    expect(young.princesses.map(String)).toEqual([
      "Sparkle",
      "Sunset",
      "Fallenstar",
    ]);
    expect(young.find("Sunset").oldName).toBe("Sunset Shimmer");
    expect(elder.find("Celestia").oldName).toBe("Celestia");
    expect(elder.find("Luna").oldName).toBe("Luna");
  });

  it("defaults are new on every call", () => {
    defaultCategories()[0].remove("0");
    expect(defaultCategories()[0].size).toBe(3);
  });
});
