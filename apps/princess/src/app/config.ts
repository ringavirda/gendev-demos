import { resolve } from "node:path";
import { z } from "zod";

/** Settings read from the environment. */
export interface Config {
  readonly storage: "json" | "sqlite";
  /** Absolute path of the JSON file or the SQLite database. */
  readonly dataPath: string;
  readonly logLevel: "debug" | "info" | "warn";
}

export const CONFIG = Symbol("Config");

/** A setting that holds a value the app does not accept. */
export class ConfigError extends Error {
  override name = "ConfigError";
}

const packageFolder = resolve(import.meta.dirname, "../..");

const unset = (value: unknown) => (value === "" ? undefined : value);

const schema = z.object({
  PRINCESS_STORAGE: z.preprocess(
    unset,
    z.enum(["json", "sqlite"]).default("json"),
  ),
  PRINCESS_DATA: z.preprocess(unset, z.string().optional()),
  LOG_LEVEL: z.preprocess(
    unset,
    z.enum(["debug", "info", "warn"]).default("warn"),
  ),
});

/**
 * Reads `PRINCESS_STORAGE` (`json` or `sqlite`, default `json`), `PRINCESS_DATA` (a file path,
 * default `data/princesses.json` or `data/princesses.db` in the package folder; a relative
 * value resolves against the current directory) and `LOG_LEVEL` (`debug`, `info` or `warn`,
 * default `warn`). An empty value counts as unset.
 * @param env the environment to read.
 * @returns the settings.
 * @throws {ConfigError} naming the first variable that holds a bad value.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ConfigError(`${issue.path.join(".")}: ${issue.message}`);
  }
  const {
    PRINCESS_STORAGE: storage,
    PRINCESS_DATA: data,
    LOG_LEVEL,
  } = parsed.data;
  const fallback = resolve(
    packageFolder,
    "data",
    storage === "json" ? "princesses.json" : "princesses.db",
  );
  return {
    storage,
    dataPath: data === undefined ? fallback : resolve(data),
    logLevel: LOG_LEVEL,
  };
}
