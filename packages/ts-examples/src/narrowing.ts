import {
  ExamplesBase,
  example,
  registerExamples,
} from "@gendev/example-runner";

@registerExamples()
export class NarrowingExamples extends ExamplesBase {
  @example("typeof, in and instanceof")
  exampleTypeofInInstanceof() {
    class Pegasus {
      fly() {
        return "flies";
      }
    }

    interface Unicorn {
      cast(): string;
    }

    interface EarthPony {
      gallop(): string;
    }

    const move = (value: string | number | Pegasus | Unicorn | EarthPony) => {
      if (typeof value === "string") return value.toUpperCase();
      if (typeof value === "number") return value.toFixed(1);
      if (value instanceof Pegasus) return value.fly();
      if ("cast" in value) return value.cast();
      return value.gallop();
    };

    this.log(move("twilight"));
    this.log(move(12));
    this.log(move(new Pegasus()));
    this.log(move({ cast: () => "casts" }));
    this.log(move({ gallop: () => "gallops" }));
  }

  exampleDiscriminatedUnion() {
    type Pony =
      | { kind: "pegasus"; weather: string }
      | { kind: "unicorn"; spell: string }
      | { kind: "earth"; harvest: string };

    const ability = (pony: Pony): string => {
      switch (pony.kind) {
        case "pegasus":
          return `weather ${pony.weather}`;
        case "unicorn":
          return `spell ${pony.spell}`;
        case "earth":
          return `harvest ${pony.harvest}`;
        default: {
          const unreachable: never = pony;
          return unreachable;
        }
      }
    };

    this.log(ability({ kind: "pegasus", weather: "rain" }));
    this.log(ability({ kind: "unicorn", spell: "teleport" }));
    this.log(ability({ kind: "earth", harvest: "apples" }));
  }

  exampleUnknownAndAny() {
    const text = '{"name":"Twilight Sparkle","friends":["Spike"]}';

    const loose = JSON.parse(text);
    try {
      this.log(loose.friend.length);
    } catch (error) {
      this.log(String(error));
    }

    const strict: unknown = JSON.parse(text);
    try {
      // @ts-expect-error: unknown has no properties until it is narrowed
      this.log(strict.friend.length);
    } catch (error) {
      this.log(String(error));
    }

    if (typeof strict === "object" && strict !== null && "name" in strict) {
      this.log(strict.name);
    }
  }

  exampleTypeGuards() {
    interface Pony {
      name: string;
    }

    interface Pegasus extends Pony {
      weather: string;
    }

    const isPegasus = (pony: Pony): pony is Pegasus => "weather" in pony;

    function assertPegasus(pony: Pony): asserts pony is Pegasus {
      if (!isPegasus(pony)) throw new TypeError(`${pony.name} has no wings`);
    }

    const rainbow: Pegasus = { name: "Rainbow Dash", weather: "clears clouds" };
    const ponies: Pony[] = [rainbow, { name: "Applejack" }];

    for (const pony of ponies) {
      this.log(isPegasus(pony) ? `${pony.name}: ${pony.weather}` : pony.name);
    }

    const first: Pony = ponies[0];
    assertPegasus(first);
    this.log(first.weather);

    try {
      assertPegasus(ponies[1]);
    } catch (error) {
      this.log(String(error));
    }
  }

  exampleSatisfies() {
    const ranks = {
      twilight: 12,
      celestia: "alicorn",
    } satisfies Record<string, number | string>;

    this.log(ranks.twilight.toFixed(1));
    this.log(ranks.celestia.toUpperCase());

    const annotated: Record<string, number | string> = {
      twilight: 12,
      celestia: "alicorn",
    };

    // @ts-expect-error: the annotation widened the value to number | string
    this.log(annotated.twilight.toFixed(1));
  }
}
