import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CLI, Executor } from "../src/index.js";

function createExecutor() {
  const cli = {
    echo: vi.fn(),
    echoInline: vi.fn(),
    echoSuccess: vi.fn(),
    echoError: vi.fn(),
    close: vi.fn(),
  };
  return { cli, executor: new Executor(cli as unknown as CLI) };
}

describe("Executor duplicate selectors", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when a selector is already held by a default command", () => {
    const { executor } = createExecutor();
    expect(() =>
      executor.registerCommand({
        selectors: ["quit", "q"],
        actionAsync: async () => {},
      }),
    ).toThrow("Command with selectors (exit, quit, q) already exists!");
  });

  it("replaces the shared command when override is set", async () => {
    const { cli, executor } = createExecutor();
    const action = vi.fn(async () => {});
    executor.registerCommand(
      { selectors: ["quit", "q"], actionAsync: action },
      true,
    );

    await executor.executeAsync({ raw: ["q"], selector: "q", list: [] });
    expect(action).toHaveBeenCalledOnce();
    expect(process.exit).not.toHaveBeenCalled();

    await executor.executeAsync({
      raw: ["exit"],
      selector: "exit",
      list: [],
    });
    expect(cli.echoError).toHaveBeenCalledWith("Unknown command: exit");
  });

  it("registers a command with no shared selector beside the defaults", async () => {
    const { cli, executor } = createExecutor();
    const action = vi.fn(async () => {});
    executor.registerCommand({ selectors: ["hello"], actionAsync: action });

    await executor.executeAsync({
      raw: ["hello"],
      selector: "hello",
      list: [],
    });
    expect(action).toHaveBeenCalledOnce();

    await executor.executeAsync({ raw: ["h"], selector: "h", list: [] });
    expect(cli.echoSuccess).toHaveBeenCalledWith(
      "Supported command signatures:",
    );
  });
});
