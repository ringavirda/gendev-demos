import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const run = promisify(execFile);
const app = fileURLToPath(new URL("../src/app.js", import.meta.url));

const runWithInput = (args, input) =>
  new Promise((resolve, reject) => {
    const child = execFile(process.execPath, [app, ...args], (error, stdout) =>
      error ? reject(error) : resolve(stdout),
    );
    child.stdin.end(input);
  });

describe("app arguments", () => {
  it("prints usage to stderr and exits 1 for an unknown option", async () => {
    const error = await run(process.execPath, [app, "--help"]).catch((e) => e);
    expect(error.code).toBe(1);
    expect(error.stderr).toContain("Unknown option '--help'");
    expect(error.stderr).toContain(
      "Usage: pnpm --filter @gendev/node-console start <example>",
    );
  });
});

describe("readline-events", () => {
  it("stops at q without a line event after the close", async () => {
    const stdout = await runWithInput(["readline-events"], "q\ny\ne\n");
    expect(stdout.match(/Bye!/g)).toHaveLength(1);
    expect(stdout).not.toContain("has selected you");
  });
});
