import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  options: { runs: { type: "string", default: "5" } },
  allowPositionals: true,
});

const runs = Number(values.runs);
if (!Number.isInteger(runs) || runs < 1) {
  console.error("--runs takes a whole number of at least 1");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(
  positionals[0] ?? join(here, "../../../packages/ts-examples"),
);
const require = createRequire(import.meta.url);

function locate(pkg, binName) {
  const manifestPath = require.resolve(`${pkg}/package.json`);
  const manifest = require(manifestPath);
  return {
    version: manifest.version,
    bin: join(dirname(manifestPath), manifest.bin[binName]),
  };
}

const compilers = [
  { label: "typescript 7", ...locate("typescript", "tsc") },
  { label: "typescript 6", ...locate("@typescript/typescript6", "tsc6") },
];

function check(compiler) {
  const start = performance.now();
  const result = spawnSync(
    process.execPath,
    [compiler.bin, "-p", project, "--noEmit"],
    { encoding: "utf8" },
  );
  const elapsed = performance.now() - start;
  if (result.status !== 0) {
    console.error(result.stdout + result.stderr);
    console.error("run pnpm build first");
    process.exit(1);
  }
  return elapsed;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

console.log(`project ${project}`);
const medians = [];
for (const compiler of compilers) {
  console.log(`${compiler.label}: ${compiler.version}`);
  check(compiler);
  const times = Array.from({ length: runs }, () => check(compiler));
  times.forEach((ms, i) => console.log(`  run ${i + 1}: ${ms.toFixed(0)} ms`));
  medians.push(median(times));
}

console.log(`median ${compilers[0].label}: ${medians[0].toFixed(0)} ms`);
console.log(`median ${compilers[1].label}: ${medians[1].toFixed(0)} ms`);
console.log(`ratio: ${(medians[1] / medians[0]).toFixed(1)}x`);
