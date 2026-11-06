import { describe, expect, it } from "vitest";
import { StderrLogger } from "../../src/app/logger.js";

describe("StderrLogger", () => {
  it("writes at or above its level with a prefix", () => {
    const lines: string[] = [];
    const logger = new StderrLogger("info", (line) => lines.push(line));
    logger.debug("no");
    logger.info("a");
    logger.warn("b");
    logger.error("c");
    expect(lines).toEqual(["[info] a", "[warn] b", "[error] c"]);
  });
});
