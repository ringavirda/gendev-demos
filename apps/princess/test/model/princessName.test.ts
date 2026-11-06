import { describe, expect, it } from "vitest";
import { DomainError, ValidationError } from "../../src/model/errors.js";
import { PrincessName } from "../../src/model/princessName.js";

describe("PrincessName", () => {
  it("trims the name", () => {
    expect(PrincessName.parse("  Luna ").value).toBe("Luna");
  });

  it("rejects a blank name", () => {
    expect(() => PrincessName.parse("   ")).toThrow(ValidationError);
    expect(() => PrincessName.parse("   ")).toThrow(DomainError);
  });

  it("rejects a name over 40 characters", () => {
    expect(() => PrincessName.parse("a".repeat(41))).toThrow(ValidationError);
    expect(PrincessName.parse("a".repeat(40)).value).toHaveLength(40);
  });

  it("compares without case", () => {
    expect(PrincessName.parse("Luna").equals(PrincessName.parse("lUNA"))).toBe(
      true,
    );
    expect(
      PrincessName.parse("Luna").equals(PrincessName.parse("Sunset")),
    ).toBe(false);
  });

  it("matches a typed prefix without case", () => {
    const name = PrincessName.parse("Celestia");
    expect(name.matches("CEL")).toBe(true);
    expect(name.matches("x")).toBe(false);
    expect(name.matches("")).toBe(false);
  });
});
