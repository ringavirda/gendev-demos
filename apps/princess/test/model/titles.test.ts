import { describe, expect, it } from "vitest";
import { Titles } from "../../src/model/titles.js";

describe("Titles", () => {
  it("parses every space around commas", () => {
    expect(Titles.parse("a, b ,c").list).toEqual(["a", "b", "c"]);
  });

  it("keeps spaces inside a title", () => {
    expect(Titles.parse("Princess of the Day, Daybreaker").list).toEqual([
      "Princess of the Day",
      "Daybreaker",
    ]);
  });

  it("drops empty entries", () => {
    expect(Titles.parse(" , ,a,,").list).toEqual(["a"]);
    expect(Titles.parse("").size).toBe(0);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(Titles.parse("a").list)).toBe(true);
  });
});
