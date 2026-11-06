import "reflect-metadata";
import { ConfigError, loadConfig } from "./config.js";
import { createContainer, resolveApp } from "./container.js";

try {
  const config = loadConfig();
  process.exitCode = await resolveApp(createContainer(config)).run(
    process.argv.slice(2),
  );
} catch (error) {
  if (!(error instanceof ConfigError)) {
    throw error;
  }
  process.stderr.write(error.message + "\n");
  process.exitCode = 1;
}
