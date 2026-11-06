import "reflect-metadata";
import { describe, expect, it } from "vitest";
import type { PrincessEvent } from "../../src/model/events.js";
import { Princess } from "../../src/model/princess.js";
import { EventBus } from "../../src/services/eventBus.js";
import { logged } from "../../src/services/logged.js";
import { subscribeLogger } from "../../src/services/listeners.js";
import { PrincessService } from "../../src/services/princessService.js";
import { MemoryPrincessRepository } from "../fakes/memoryRepository.js";
import { RecordingLogger } from "../fakes/recordingLogger.js";

class Worker {
  readonly logger = new RecordingLogger();

  @logged
  async work(name: string, count: number): Promise<string> {
    return `${name}${count}`;
  }

  @logged
  async fail(): Promise<void> {
    throw new Error("broken");
  }
}

describe("logged", () => {
  it("writes the call and duration at debug", async () => {
    const worker = new Worker();
    expect(await worker.work("a", 2)).toBe("a2");
    expect(worker.logger.lines).toHaveLength(1);
    const [level, message] = worker.logger.lines[0];
    expect(level).toBe("debug");
    expect(message).toMatch(/^work\(a, 2\) took \d+ ms$/);
  });

  it("writes a failure and rethrows", async () => {
    const worker = new Worker();
    await expect(worker.fail()).rejects.toThrow("broken");
    expect(worker.logger.lines[0][1]).toMatch(/failed after \d+ ms$/);
  });

  it("service methods are logged", async () => {
    const logger = new RecordingLogger();
    const service = new PrincessService(
      new MemoryPrincessRepository(),
      new EventBus<PrincessEvent>(),
      logger,
      () => 0,
    );
    await service.select("young", "sp");
    const [level, message] = logger.lines[0];
    expect(level).toBe("debug");
    expect(message.startsWith("select(young, sp)")).toBe(true);
  });
});

describe("subscribeLogger", () => {
  it("the logger listener writes each event at info", () => {
    const bus = new EventBus<PrincessEvent>();
    const logger = new RecordingLogger();
    subscribeLogger(bus, logger);
    bus.publish({
      type: "added",
      category: "young",
      princess: Princess.of({ commonName: "Moonlight" }),
    });
    expect(logger.lines).toEqual([["info", "added Moonlight to young"]]);
  });
});
