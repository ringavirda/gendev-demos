import {
  ExamplesBase,
  example,
  registerExamples,
} from "@gendev/example-runner";

@registerExamples()
export class TypingExamples extends ExamplesBase {
  exampleInference() {
    const powerRank = 12;
    const name: string = "Sparkle";
    const ranks = [powerRank];

    this.log(`${name}: ${powerRank} is a ${typeof powerRank}`);

    // @ts-expect-error: ranks was inferred as number[]
    ranks.push("thirteen");
  }

  exampleInterfaceAndType() {
    interface Pony {
      name: string;
    }

    interface Princess extends Pony {
      powerRank: number;
    }

    type Alicorn = Pony & {
      powerRank: number;
    };

    const twilight: Princess = { name: "Sparkle", powerRank: 12 };
    const cadance: Alicorn = { name: "Cadance", powerRank: 10 };
    this.log([twilight, cadance]);

    // @ts-expect-error: powerRank is required
    const spike: Princess = { name: "Spike" };
    this.log(spike);
  }

  exampleDeclarationMerging() {
    interface Princess {
      name: string;
    }

    interface Princess {
      powerRank: number;
    }

    const describe = (princess: Princess) => {
      this.log(`${princess.name}: ${princess.powerRank}`);
    };

    describe({ name: "Luna", powerRank: 11 });
    // @ts-expect-error: the merged Princess also requires powerRank
    describe({ name: "Celestia" });
  }

  exampleLiteralUnions() {
    type Aspect = "day" | "night";

    const princesses: Record<Aspect, string> = {
      day: "Celestia",
      night: "Luna",
    };

    const getPrincess = (aspect: Aspect) => princesses[aspect];

    this.log(getPrincess("night"));
    // @ts-expect-error: "dusk" is not in the union
    this.log(getPrincess("dusk"));
  }

  exampleAsConst() {
    const princesses = {
      day: "Celestia",
      night: "Luna",
    };

    const getPrincess = (aspect: "day" | "night") => princesses[aspect];

    const aspects = {
      first: "day",
      second: "night",
    };

    // aspects.first = "destruction" would be allowed, so the property is a string.
    // @ts-expect-error: aspects.first is widened to string
    this.log(getPrincess(aspects.first));

    const aspectsAsConst = {
      first: "day",
      second: "night",
    } as const;

    this.log(getPrincess(aspectsAsConst.first));
  }

  @example("keyof typeof")
  exampleTypeofKeyof() {
    const princessesAsConst = {
      day: "Celestia",
      night: "Luna",
      love: "Cadance",
      friendship: "Twilight Sparkle",
    } as const;

    type Aspects = keyof typeof princessesAsConst;
    type Princesses = (typeof princessesAsConst)[Aspects];

    const getPrincess = (aspect: Aspects): Princesses =>
      princessesAsConst[aspect];

    this.log(getPrincess("love"));
    this.log(getPrincess("friendship"));
  }
}
