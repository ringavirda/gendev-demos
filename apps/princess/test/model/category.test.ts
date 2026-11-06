import { describe, expect, it } from "vitest";
import { Category, resolveCategoryName } from "../../src/model/category.js";
import { DuplicateError, NotFoundError } from "../../src/model/errors.js";
import { Princess } from "../../src/model/princess.js";

const young = () =>
  new Category("young", [
    Princess.of({ commonName: "Sparkle" }),
    Princess.of({ commonName: "Sunset" }),
    Princess.of({ commonName: "Fallenstar" }),
  ]);

const names = (category: Category) => category.princesses.map(String);

describe("Category", () => {
  it("finds by prefix, first match in order", () => {
    expect(String(young().find("s"))).toBe("Sparkle");
    expect(String(young().find("su"))).toBe("Sunset");
  });

  it("finds by index", () => {
    expect(String(young().find("2"))).toBe("Fallenstar");
  });

  it("rejects negative, out-of-range, non-integer and blank", () => {
    for (const text of ["-1", "3", "1.5", ""]) {
      expect(() => young().find(text)).toThrow(NotFoundError);
    }
  });

  it("refuses a duplicate name without case", () => {
    const category = young();
    expect(() => category.add(Princess.of({ commonName: "sparkle" }))).toThrow(
      DuplicateError,
    );
    expect(category.size).toBe(3);
  });

  it("removes the last princess and returns her", () => {
    const category = young();
    expect(String(category.remove("2"))).toBe("Fallenstar");
    expect(names(category)).toEqual(["Sparkle", "Sunset"]);
  });

  it("may be emptied", () => {
    const category = young();
    category.remove("0");
    category.remove("0");
    category.remove("0");
    expect(category.size).toBe(0);
    expect(() => category.find("0")).toThrow(NotFoundError);
  });

  it("replaces in place", () => {
    const category = young();
    const previous = category.replace(
      Princess.of({ commonName: "Sunset", oldName: "Sunset Shimmer" }),
    );
    expect(previous.oldName).toBeUndefined();
    expect(names(category)).toEqual(["Sparkle", "Sunset", "Fallenstar"]);
    expect(category.find("1").oldName).toBe("Sunset Shimmer");
  });

  it("rejects duplicates given to the constructor", () => {
    expect(
      () =>
        new Category("x", [
          Princess.of({ commonName: "Luna" }),
          Princess.of({ commonName: "LUNA" }),
        ]),
    ).toThrow(DuplicateError);
  });

  it("resolves a category name by prefix", () => {
    expect(resolveCategoryName(["elder", "young"], "Y")).toBe("young");
    expect(() => resolveCategoryName(["elder", "young"], "x")).toThrow(
      NotFoundError,
    );
    expect(() => resolveCategoryName(["elder", "young"], "")).toThrow(
      NotFoundError,
    );
  });
});
