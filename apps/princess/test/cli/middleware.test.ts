import { describe, expect, it } from "vitest";
import { createHarness } from "./harness.js";

describe("princess middleware", () => {
  it("domain errors print their message and fail", async () => {
    const { executor, stderr } = createHarness();
    expect(await executor.execute("g y nope")).toBe("failed");
    expect(stderr()).toContain("Err: Unknown princess [nope].");
  });

  it("unexpected errors print a generic line and log the stack", async () => {
    const { executor, stderr, logger } = createHarness();
    executor.registerCommand({
      selectors: ["boom"],
      params: [],
      description: "Throws.",
      action: () => {
        throw new TypeError("secret detail");
      },
    });
    expect(await executor.execute("boom")).toBe("failed");
    expect(stderr()).toEqual(["Err: Unexpected error"]);
    expect(
      logger.lines.some(
        ([level, line]) => level === "error" && line.includes("TypeError"),
      ),
    ).toBe(true);
  });

  it("a wrong word count is a usage status", async () => {
    const { executor, stderr } = createHarness();
    expect(await executor.execute("g y")).toBe("usage");
    expect(stderr()).toContain("Err: Usage: get <category> <princess>");
  });

  it("timing wraps the argument check", async () => {
    const { executor, logger } = createHarness();
    await executor.execute("g y");
    expect(
      logger.lines.some(
        ([level, line]) => level === "debug" && /^get took \d+ ms$/.test(line),
      ),
    ).toBe(true);
  });
});
