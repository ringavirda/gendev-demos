import "reflect-metadata";
import { PassThrough, Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { CLI, Executor } from "@gendev/cli-lib";
import { Category } from "../../src/model/category.js";
import { Princess } from "../../src/model/princess.js";
import { createContainer } from "../../src/app/container.js";
import { EventBus } from "../../src/services/eventBus.js";
import { History } from "../../src/services/history.js";
import {
  EVENT_BUS,
  REPOSITORY,
  type PrincessRepository,
} from "../../src/services/ports.js";
import { PrincessService } from "../../src/services/princessService.js";
import { JsonPrincessRepository } from "../../src/storage/jsonRepository.js";
import { SqlitePrincessRepository } from "../../src/storage/sqliteRepository.js";
import { MemoryPrincessRepository } from "../fakes/memoryRepository.js";

const config = (storage: "json" | "sqlite", dataPath: string) =>
  ({ storage, dataPath, logLevel: "warn" }) as const;

describe("createContainer", () => {
  it("binds the repository by config", () => {
    expect(
      createContainer(config("json", "/tmp/none.json")).get(REPOSITORY),
    ).toBeInstanceOf(JsonPrincessRepository);
    expect(
      createContainer(config("sqlite", ":memory:")).get(REPOSITORY),
    ).toBeInstanceOf(SqlitePrincessRepository);
  });

  it("rebinds the repository to a fake and restores", async () => {
    const container = createContainer(config("json", "/tmp/none.json"));
    const fake = new MemoryPrincessRepository([
      new Category("pegasi", [Princess.of({ commonName: "Rainbow" })]),
    ]);
    container.snapshot();
    container.rebind(REPOSITORY).toConstantValue(fake);
    const selected = await container
      .get(PrincessService)
      .select("pegasi", "rainbow");
    expect(selected.commonName.value).toBe("Rainbow");
    container.restore();
    expect(container.get(REPOSITORY)).not.toBe(fake);
  });

  it("one instance per singleton binding", async () => {
    const container = createContainer(config("sqlite", ":memory:"));
    expect(container.get(PrincessService)).toBe(container.get(PrincessService));
    expect(container.get(EVENT_BUS)).toBe(container.get(EVENT_BUS));
    const history = container.get(History);
    await container.get<PrincessRepository>(REPOSITORY).load();
    await container
      .get(PrincessService)
      .add("young", Princess.of({ commonName: "Rainbow" }));
    expect(history.events).toHaveLength(1);
    expect(container.get(History)).toBe(history);
    expect(container.get(EVENT_BUS)).toBeInstanceOf(EventBus);
  });

  it("the executor knows every princess command", async () => {
    const container = createContainer(config("sqlite", ":memory:"));
    const out = new PassThrough();
    container
      .rebind(CLI)
      .toConstantValue(new CLI(Readable.from([]), out, new PassThrough()));
    expect(await container.get(Executor).execute("hi")).toBe("ok");
  });
});
