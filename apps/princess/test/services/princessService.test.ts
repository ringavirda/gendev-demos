import "reflect-metadata";
import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../src/model/errors.js";
import type { PrincessEvent } from "../../src/model/events.js";
import { Princess } from "../../src/model/princess.js";
import { EventBus } from "../../src/services/eventBus.js";
import { History } from "../../src/services/history.js";
import type { Random } from "../../src/services/ports.js";
import { PrincessService } from "../../src/services/princessService.js";
import { MemoryPrincessRepository } from "../fakes/memoryRepository.js";
import { RecordingLogger } from "../fakes/recordingLogger.js";

function setup(
  repository = new MemoryPrincessRepository(),
  random: Random = () => 0,
) {
  const bus = new EventBus<PrincessEvent>();
  const logger = new RecordingLogger();
  const service = new PrincessService(repository, bus, logger, random);
  const events: PrincessEvent[] = [];
  bus.subscribe((event) => events.push(event));
  return { repository, bus, logger, service, events };
}

const moonlight = () => Princess.of({ commonName: "Moonlight" });

const emptyYoung = async (service: PrincessService) => {
  await service.remove("young", "0");
  await service.remove("young", "0");
  await service.remove("young", "0");
};

describe("PrincessService with a fake repository", () => {
  it("selects by prefix and by index", async () => {
    const { service } = setup();
    expect(String(await service.select("y", "su"))).toBe("Sunset");
    expect(String(await service.select("e", "2"))).toBe("Cadance");
  });

  it("add saves and publishes added", async () => {
    const { service, repository, events } = setup();
    await service.add("young", moonlight());
    const young = await repository.get("young");
    expect(young.princesses.map(String).at(-1)).toBe("Moonlight");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "added", category: "young" });
  });

  it("publishes events in order", async () => {
    const { service, events } = setup();
    await service.add("young", moonlight());
    await service.remove("young", "sunset");
    await service.change("young", "sp", { titles: ["Librarian"] });
    expect(events.map((event) => event.type)).toEqual([
      "added",
      "removed",
      "changed",
    ]);
  });

  it("publishes nothing when the save fails", async () => {
    const { service, repository, events } = setup();
    repository.failSaves = true;
    await expect(service.add("young", moonlight())).rejects.toThrow();
    expect(events).toEqual([]);
  });

  it("remove of the last princess saves", async () => {
    const { service, repository } = setup();
    const removed = await service.remove("young", "2");
    expect(String(removed)).toBe("Fallenstar");
    expect((await repository.get("young")).princesses.map(String)).toEqual([
      "Sparkle",
      "Sunset",
    ]);
  });

  it("change keeps fields it is not given", async () => {
    const { service } = setup();
    const changed = await service.change("young", "sparkle", {
      titles: ["Librarian"],
    });
    expect(changed.oldName).toBe("Twilight Sparkle");
    expect(changed.titles.list).toEqual(["Librarian"]);
  });

  it("pickRandom reaches the last category and princess", async () => {
    const random = vi.fn((max: number) => max - 1);
    const { service } = setup(undefined, random);
    expect(String(await service.pickRandom())).toBe("Fallenstar");
    expect(random.mock.calls).toEqual([[2], [3]]);
  });

  it("pickRandom skips empty categories and refuses an empty named one", async () => {
    const random = vi.fn((max: number) => max - 1);
    const { service, repository } = setup(undefined, random);
    await emptyYoung(service);
    random.mockClear();
    expect(String(await service.pickRandom())).toBe("Cadance");
    expect(random.mock.calls[0]).toEqual([1]);
    await expect(service.pickRandom("young")).rejects.toThrow(
      new NotFoundError("Category [young] is empty."),
    );
    for (const index of [0, 0, 0]) {
      await service.remove("elder", String(index));
    }
    await expect(service.pickRandom()).rejects.toThrow(
      new NotFoundError("No princesses to pick from."),
    );
    expect(await repository.categoryNames()).toEqual(["elder", "young"]);
  });

  it("an emptied category stays listed", async () => {
    const { service } = setup();
    await emptyYoung(service);
    expect(await service.categoryNames()).toEqual(["elder", "young"]);
    expect((await service.category("young")).size).toBe(0);
  });

  it("history keeps the session's events", async () => {
    const { service, bus } = setup();
    const history = new History(bus);
    await service.add("young", moonlight());
    await service.remove("young", "moonlight");
    expect(history.events.map((event) => event.type)).toEqual([
      "added",
      "removed",
    ]);
  });
});
