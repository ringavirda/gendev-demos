import "reflect-metadata";
import { describe, expect, it, vi } from "vitest";
import { defaultCategories } from "../../src/model/defaults.js";
import { DuplicateError } from "../../src/model/errors.js";
import type { PrincessEvent } from "../../src/model/events.js";
import { Princess } from "../../src/model/princess.js";
import { EventBus } from "../../src/services/eventBus.js";
import type { PrincessRepository } from "../../src/services/ports.js";
import { PrincessService } from "../../src/services/princessService.js";
import { RecordingLogger } from "../fakes/recordingLogger.js";

function setup() {
  const repository = {
    load: vi.fn(async () => {}),
    categoryNames: vi.fn(async () => ["elder", "young"]),
    get: vi.fn(async () => defaultCategories()[1]),
    save: vi.fn<PrincessRepository["save"]>(async () => {}),
  } satisfies PrincessRepository;
  const service = new PrincessService(
    repository,
    new EventBus<PrincessEvent>(),
    new RecordingLogger(),
    () => 0,
  );
  return { repository, service };
}

describe("PrincessService with a mock repository", () => {
  it("a duplicate add never calls save", async () => {
    const { repository, service } = setup();
    await expect(
      service.add("young", Princess.of({ commonName: "Sparkle" })),
    ).rejects.toThrow(DuplicateError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("remove saves the category without her", async () => {
    const { repository, service } = setup();
    await service.remove("young", "1");
    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.princesses.map(String)).toEqual(["Sparkle", "Fallenstar"]);
  });
});
