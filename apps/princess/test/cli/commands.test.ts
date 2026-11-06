import { describe, expect, it } from "vitest";
import { createHarness } from "./harness.js";

describe("princess commands", () => {
  it("list prints categories and one category with indices", async () => {
    const { executor, stdout } = createHarness();
    await executor.execute("ls");
    expect(stdout()).toContain(" - elder");
    expect(stdout()).toContain(" - young");
    await executor.execute("ls y");
    expect(stdout()).toContain("Displaying category [young]:");
    expect(stdout()).toContain("  0 - Sparkle (Twilight Sparkle)");
  });

  it("get prints the selected princess", async () => {
    const { executor, stdout } = createHarness();
    expect(await executor.execute("g y 2")).toBe("ok");
    expect(stdout()).toContain(
      "Yay! You've selected: Fallenstar (Starfall Fading)",
    );
  });

  it("add takes the typed name, not the category", async () => {
    const { executor, service } = createHarness([
      "Shadow Moonlight\n",
      "Moon Princess, Night Light\n",
    ]);
    expect(await executor.execute("add young Moonlight")).toBe("ok");
    const young = await service.category("young");
    expect(young.princesses.map(String)).toEqual([
      "Sparkle",
      "Sunset",
      "Fallenstar",
      "Moonlight",
    ]);
    expect(young.princesses[3].oldName).toBe("Shadow Moonlight");
    expect(young.princesses[3].titles.list).toEqual([
      "Moon Princess",
      "Night Light",
    ]);
  });

  it("add at end of input adds without optional fields", async () => {
    const { executor, service } = createHarness();
    expect(await executor.execute("add young Moonlight")).toBe("ok");
    const added = (await service.category("young")).find("3");
    expect(String(added)).toBe("Moonlight");
    expect(added.oldName).toBeUndefined();
    expect(added.titles.size).toBe(0);
  });

  it("remove asks and removes on yes", async () => {
    const { executor, stdout, service } = createHarness(["yes\n"]);
    expect(await executor.execute("rm y sun")).toBe("ok");
    expect(stdout().join("\n")).toContain(
      "[Sunset] is removed from category [young]",
    );
    expect((await service.category("young")).size).toBe(2);
  });

  it("remove without yes is aborted", async () => {
    const { executor, stderr, service } = createHarness();
    expect(await executor.execute("rm y sun")).toBe("failed");
    expect(stderr()).toContain("Err: Operation aborted.");
    expect(String((await service.category("young")).find("1"))).toBe("Sunset");
  });

  it("change keeps the old name when left empty", async () => {
    const { executor, service } = createHarness(["\n", "a, b\n", "yes\n"]);
    expect(await executor.execute("ch y 1")).toBe("ok");
    const changed = (await service.category("young")).find("1");
    expect(changed.oldName).toBe("Sunset Shimmer");
    expect(changed.titles.list).toEqual(["a", "b"]);
  });

  it("change with nothing new skips", async () => {
    const { executor, stdout, history } = createHarness(["\n", "\n", "yes\n"]);
    expect(await executor.execute("ch y 1")).toBe("ok");
    expect(stdout().join("\n")).toContain("Warn: No changes, skipping.");
    expect(history.events).toHaveLength(0);
  });

  it("history prints the session's events", async () => {
    const { executor, stdout } = createHarness();
    await executor.execute("hi");
    expect(stdout()).toContain("No changes yet.");
    await executor.execute("add young Moonlight");
    await executor.execute("hi");
    expect(stdout()).toContain("added Moonlight to young");
    expect(stdout().filter((l) => l === "No changes yet.")).toHaveLength(1);
  });

  it("remove and change act on the selected princess when a name is a prefix of an earlier one", async () => {
    const { executor, service } = createHarness(["\n", "\n", "yes\n"]);
    await executor.execute("add young Sun");
    await executor.execute("rm y 3");
    expect((await service.category("young")).princesses.map(String)).toEqual([
      "Sparkle",
      "Sunset",
      "Fallenstar",
    ]);
  });

  it("change by index changes the selected princess", async () => {
    const { executor, service } = createHarness([
      "\n",
      "\n",
      "\n",
      "x\n",
      "yes\n",
    ]);
    await executor.execute("add young Sun");
    expect(await executor.execute("ch y 3")).toBe("ok");
    expect((await service.category("young")).find("3").titles.list).toEqual([
      "x",
    ]);
  });
});
