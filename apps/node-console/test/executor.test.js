import { beforeEach, describe, expect, it, vi } from "vitest";
import { Executor } from "../src/selector/executor.js";

describe("Executor", () => {
  let output;
  let executor;

  const command = (selectors, params, action = vi.fn()) => ({
    selectors,
    params,
    description: "Test command.",
    action,
  });

  beforeEach(() => {
    output = [];
    const push = (kind) => (message) => output.push([kind, message]);
    executor = new Executor({
      echo: push("echo"),
      echoSuccess: push("success"),
      echoWarn: push("warn"),
      echoError: push("error"),
    });
  });

  it("runs a command by any selector with its words", async () => {
    const add = command(["add", "a"], ["category", "name"]);
    executor.registerCommand(add);
    await executor.execute("a young Rarity");
    await executor.execute("add young Rarity");
    await executor.execute("  add \t young   Rarity  ");
    expect(add.action.mock.calls).toEqual([
      ["young", "Rarity"],
      ["young", "Rarity"],
      ["young", "Rarity"],
    ]);
  });

  it("ignores an empty line", async () => {
    const a = command(["a"], []);
    executor.registerCommand(a);
    await executor.execute("   ");
    expect(output).toEqual([]);
    expect(a.action).not.toHaveBeenCalled();
  });

  it("reports an unknown command", async () => {
    await executor.execute("x");
    expect(output).toEqual([["error", "Unknown command: x"]]);
  });

  it("checks the word count against params", async () => {
    const add = command(["add", "a"], ["category", "name"]);
    const ls = command(["ls"], ["category?"]);
    executor.registerCommand(add);
    executor.registerCommand(ls);
    await executor.execute("add young");
    await executor.execute("ls");
    await executor.execute("ls young");
    await executor.execute("ls a b");
    expect(output).toEqual([
      ["error", "Usage: add <category> <name>"],
      ["error", "Usage: ls [category]"],
    ]);
    expect(add.action).not.toHaveBeenCalled();
    expect(ls.action.mock.calls).toEqual([[], ["young"]]);
  });

  it("prints a thrown error and keeps going", async () => {
    executor.registerCommand(
      command(["boom"], [], () => {
        throw new Error("boom");
      }),
    );
    executor.registerCommand(
      command(["later"], [], async () => {
        throw new Error("later");
      }),
    );
    const ok = command(["ok"], []);
    executor.registerCommand(ok);
    await executor.execute("boom");
    await executor.execute("ok");
    await executor.execute("later");
    expect(output).toEqual([
      ["error", "boom"],
      ["error", "later"],
    ]);
    expect(ok.action).toHaveBeenCalledOnce();
  });

  it("refuses a taken selector", () => {
    expect(() => executor.registerCommand(command(["a", "h"], []))).toThrow(
      "Selector [h] is already registered.",
    );
    executor.registerCommand(command(["a"], []));
    expect(() => executor.registerCommand(command(["a"], []))).toThrow(
      "Selector [a] is already registered.",
    );
  });

  it("builds help from the command data", async () => {
    executor.registerCommand(command(["add", "a"], ["category", "name"]));
    await executor.execute("help");
    const lines = output.map(([, message]) => message);
    expect(lines).toContain("  add, a <category> <name> - Test command.");
    expect(lines).toContain(
      "  help, h [command] - Show the command list or one command.",
    );

    output.length = 0;
    await executor.execute("help add");
    expect(output).toEqual([
      ["echo", "  add, a <category> <name> - Test command."],
    ]);

    output.length = 0;
    await executor.execute("help x");
    expect(output).toEqual([["error", "Unknown command: x"]]);
  });
});
