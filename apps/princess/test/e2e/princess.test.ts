import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const packageFolder = resolve(import.meta.dirname, "../..");
const entry = join(packageFolder, "dist/app/main.js");
const timeout = 20_000;

interface Run {
  readonly code: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

function run(
  args: readonly string[],
  env: Record<string, string>,
  input = "",
): Promise<Run> {
  return new Promise((done, fail) => {
    const environment = { ...process.env, LOG_LEVEL: "", ...env };
    const child = spawn("node", [entry, ...args], {
      cwd: packageFolder,
      env: environment,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => (stderr += chunk.toString()));
    child.on("error", fail);
    child.on("close", (code) => done({ code, stdout, stderr }));
    if (input !== "") {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

const folders: string[] = [];

async function tempFolder(): Promise<string> {
  const folder = await mkdtemp(join(tmpdir(), "princess-e2e-"));
  folders.push(folder);
  return folder;
}

beforeAll(() => {
  if (!existsSync(entry)) {
    throw new Error("run pnpm build first");
  }
});

afterAll(async () => {
  await Promise.all(
    folders.map((folder) => rm(folder, { recursive: true, force: true })),
  );
});

describe.each(["json", "sqlite"] as const)("%s storage", (storage) => {
  const extension = storage === "json" ? "json" : "db";

  async function setup(): Promise<{
    env: Record<string, string>;
    file: string;
  }> {
    const file = join(await tempFolder(), `princesses.${extension}`);
    return {
      env: { PRINCESS_STORAGE: storage, PRINCESS_DATA: file },
      file,
    };
  }

  it(
    "one-shot get exits 0",
    async () => {
      const { env } = await setup();
      const result = await run(["get", "young", "sunset"], env);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("Yay! You've selected: Sunset");
      expect(result.stdout).not.toContain("\u001b");
    },
    timeout,
  );

  it(
    "an unknown princess exits 1",
    async () => {
      const { env } = await setup();
      const result = await run(["get", "young", "nobody"], env);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain("Err:");
      expect(result.stderr).not.toContain("\u001b");
    },
    timeout,
  );

  it(
    "an unknown command exits 2",
    async () => {
      const { env } = await setup();
      const result = await run(["nope"], env);
      expect(result.code).toBe(2);
      expect(result.stderr).toContain("Unknown command: nope");
    },
    timeout,
  );

  it(
    "a wrong word count exits 2",
    async () => {
      const { env } = await setup();
      const result = await run(["get", "young"], env);
      expect(result.code).toBe(2);
      expect(result.stderr).toContain("Usage: get <category> <princess>");
    },
    timeout,
  );

  it(
    "rm with stdin closed exits 1 and keeps her",
    async () => {
      const { env } = await setup();
      const removed = await run(["rm", "young", "sunset"], env);
      expect(removed.code).toBe(1);
      expect(removed.stderr).toContain("Operation aborted.");
      const kept = await run(["get", "young", "sunset"], env);
      expect(kept.code).toBe(0);
    },
    timeout,
  );

  it(
    "a piped session adds a princess that survives a restart",
    async () => {
      const { env } = await setup();
      const session = await run(
        [],
        env,
        "add young Moonlight\n\nMoon Princess, Night Light\nls young\nq\n",
      );
      expect(session.code).toBe(0);
      expect(session.stdout).toContain("  3 - Moonlight");
      const again = await run(["get", "young", "moon"], env);
      expect(again.code).toBe(0);
      expect(again.stdout).toContain("Yay! You've selected: Moonlight");
      expect(again.stdout).toContain("\tMoon Princess, Night Light");
      expect(session.stdout).not.toContain(" - young");
    },
    timeout,
  );

  it(
    "an emptied category survives a restart",
    async () => {
      const { env } = await setup();
      for (let removed = 0; removed < 3; removed++) {
        const result = await run(["rm", "elder", "0"], env, "yes\n");
        expect(result.code).toBe(0);
      }
      const categories = await run(["ls"], env);
      expect(categories.stdout).toContain(" - elder");
      const elder = await run(["ls", "elder"], env);
      expect(elder.code).toBe(0);
      expect(elder.stdout).toBe("Displaying category [elder]:\n");
      const random = await run(["getrnd", "elder"], env);
      expect(random.code).toBe(1);
      expect(random.stderr).not.toContain("Unexpected error");
    },
    timeout,
  );

  it(
    "creates a missing data folder",
    async () => {
      const { env } = await setup();
      const file = join(
        await tempFolder(),
        "a",
        "b",
        `princesses.${extension}`,
      );
      const result = await run(["ls"], { ...env, PRINCESS_DATA: file });
      expect(result.code).toBe(0);
      expect(existsSync(file)).toBe(true);
    },
    timeout,
  );

  it(
    "debug logs go to stderr only",
    async () => {
      const { env } = await setup();
      const result = await run(["ls"], { ...env, LOG_LEVEL: "debug" });
      expect(result.code).toBe(0);
      expect(result.stderr).toContain("[debug]");
      expect(result.stdout).not.toContain("[debug]");
    },
    timeout,
  );

  if (storage === "json") {
    it(
      "a damaged file exits 1 naming it",
      async () => {
        const { env, file } = await setup();
        await writeFile(file, "{not json");
        const result = await run(["ls"], env);
        expect(result.code).toBe(1);
        expect(result.stderr).toContain(file);
        expect(result.stderr).not.toContain("    at ");
        expect(await readFile(file, "utf8")).toBe("{not json");
      },
      timeout,
    );

    it(
      "a bad PRINCESS_STORAGE exits 1 naming it",
      async () => {
        const { env } = await setup();
        const result = await run(["ls"], { ...env, PRINCESS_STORAGE: "mongo" });
        expect(result.code).toBe(1);
        expect(result.stderr).toContain("PRINCESS_STORAGE");
        expect(result.stderr.trim().split("\n")).toHaveLength(1);
      },
      timeout,
    );
  } else {
    it(
      "a text file as the db exits 1 naming it, one stderr line",
      async () => {
        const { env, file } = await setup();
        await writeFile(file, "this is not a database, only text\n".repeat(20));
        const result = await run(["ls"], env);
        expect(result.code).toBe(1);
        expect(result.stderr).toContain(file);
        expect(result.stderr.trim().split("\n")).toHaveLength(1);
      },
      timeout,
    );
  }
});
