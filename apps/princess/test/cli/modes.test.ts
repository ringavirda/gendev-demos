import { describe, expect, it } from "vitest";
import { runInteractive } from "../../src/cli/interactive.js";
import { runOnce } from "../../src/cli/oneShot.js";
import { createHarness } from "./harness.js";

describe("front ends", () => {
  it("one-shot exit codes", async () => {
    const { executor } = createHarness();
    expect(await runOnce(executor, ["get", "young", "sparkle"])).toBe(0);
    expect(await runOnce(executor, ["get", "young", "nope"])).toBe(1);
    expect(await runOnce(executor, ["nope"])).toBe(2);
    expect(await runOnce(executor, ["get", "young"])).toBe(2);
  });

  it("interactive runs piped lines until a quit word", async () => {
    const { cli, executor, stdout } = createHarness([
      "ls young\n",
      "q\n",
      "ls\n",
    ]);
    await runInteractive(cli, executor);
    const lines = stdout();
    expect(
      lines.filter((line) => line.startsWith("  0 - Sparkle")),
    ).toHaveLength(1);
    expect(lines).not.toContain(" - elder");
    expect(lines.at(-1)).toMatch(/Fallenstar is always watching...$/);
  });

  it("interactive ends at end of input with the goodbye", async () => {
    const { cli, executor, stdout } = createHarness(["ls young\n"]);
    await runInteractive(cli, executor);
    expect(stdout().at(-1)).toMatch(/Fallenstar is always watching...$/);
  });

  it("prompts inside a command read the next piped lines", async () => {
    const { cli, executor, stdout } = createHarness([
      "add young Moonlight\n",
      "\n",
      "A, B\n",
      "ls young\n",
    ]);
    await runInteractive(cli, executor);
    expect(stdout()).toContain("  3 - Moonlight");
    expect(stdout()).toContain("\tA, B");
  });
});
