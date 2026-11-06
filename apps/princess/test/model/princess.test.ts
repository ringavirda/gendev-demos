import { describe, expect, it } from "vitest";
import { Princess } from "../../src/model/princess.js";

describe("Princess", () => {
  it("fullName falls back to the common name", () => {
    expect(Princess.of({ commonName: "Luna" }).fullName).toBe("Luna");
    expect(
      Princess.of({ commonName: "Sparkle", oldName: "Twilight Sparkle" })
        .fullName,
    ).toBe("Twilight Sparkle");
  });

  it("with keeps the fields it is not given, and leaves the original", () => {
    const original = Princess.of({
      commonName: "Sparkle",
      oldName: "Twilight Sparkle",
      titles: ["Princess of Friendship"],
    });
    const changed = original.with({ titles: ["Element of Magic"] });
    expect(changed.oldName).toBe("Twilight Sparkle");
    expect(changed.titles.list).toEqual(["Element of Magic"]);
    expect(original.titles.list).toEqual(["Princess of Friendship"]);
    expect(original.with({ oldName: "Twilight" }).titles.list).toEqual([
      "Princess of Friendship",
    ]);
  });

  it("a blank old name is none, one equal to the common name stays", () => {
    expect(
      Princess.of({ commonName: "Luna", oldName: "  " }).oldName,
    ).toBeUndefined();
    expect(Princess.of({ commonName: "Luna", oldName: "Luna" }).oldName).toBe(
      "Luna",
    );
  });
});
