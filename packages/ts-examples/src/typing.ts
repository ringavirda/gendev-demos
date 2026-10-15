/* eslint-disable @typescript-eslint/no-unused-vars */
import { ExamplesBase, registerExamples } from "@gendev/example-runner";

@registerExamples()
export class TypingExamples extends ExamplesBase {
  exampleInterface() {
    interface Princess {
      surname: string;
      name: string;
      powerRank: number;
    }

    const addPrincess = (req: Princess) => {
      this.log(`Added: ${JSON.stringify(req)}`);
    };

    // Compiler will complain if we don't initialize all fields.
    // addPrincess({
    //   name: "Sparkle",
    //   surname: "Twilight",
    // });

    // Interfaces can be extended.
    this.separator();

    interface Princess {
      isAwakened: boolean;
    }

    addPrincess({
      name: "Shimmer",
      surname: "Sunset",
      powerRank: 12,
      isAwakened: false,
    });
  }

  exampleType() {
    type Princess = {
      surname: string;
      name: string;
      powerRank: number;
    };

    const addPrincess = (req: Princess) => {
      this.log(`Added: ${JSON.stringify(req)}`);
    };

    // Compiler will complain if we don't initialize all fields.
    // addPrincess({
    //   name: "Sparkle",
    //   surname: "Twilight",
    // });

    // Types can be combined.

    type Queen = {
      name: "Chrysalis";
    };

    type Combined = Princess | Queen;

    const addPower = (req: Combined) => {
      this.log(`Added: ${JSON.stringify(req)}`);
    };

    addPower({ name: "Chrysalis" });
    // addPower({ name: "Trixie" }); // Compiler will complain.
  }

  exampleAsConst() {
    const princesses = {
      day: "Celestia",
      night: "Luna",
    };

    const aspects = {
      first: "day",
      second: "night",
    };

    const getPrincess = (aspect: "day" | "night") => {
      return princesses[aspect];
    };

    this.log(getPrincess("night")); // Will work.
    // this.log(getPrincess(aspects.first)); // Compiler will complain!

    // Reason:
    // princesses.destruction = "Fallenstar";
    // this.log(getPrincess("destruction"));
    this.separator();

    const aspectsAsConst = {
      first: "day",
      second: "night",
    } as const;

    this.log(getPrincess("night"));
    this.log(getPrincess(aspectsAsConst.first)); // Works fine.
  }

  exampleTypeofKeyof() {
    const princessesAsConst = {
      day: "Celestia",
      night: "Luna",
      love: "Cadance",
      friendship: "Twilight",
    } as const;

    // Const is not necessary here but suggested.
    type Aspects = keyof typeof princessesAsConst;
    type Princesses = (typeof princessesAsConst)[Aspects];

    const getPrincessConst = (aspect: Aspects): Princesses => {
      return princessesAsConst[aspect];
    };

    this.log(getPrincessConst("love"));
    this.log(getPrincessConst("friendship"));
  }

  exampleMeta() {
    type Princesses = {
      day: "Celestia";
      night: "Luna";
      love: "Cadance";
      friendship: "Twilight";
    };

    type GetPrincessMeta<T extends keyof Princesses> = Princesses[T];

    const friendship: GetPrincessMeta<"friendship"> = "Twilight";
    const night: GetPrincessMeta<"night"> = "Luna";

    this.log(friendship);
    this.log(night);
  }
}
