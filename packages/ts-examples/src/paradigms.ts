import { ExamplesBase, registerExamples } from "@gendev/example-runner";

type Kind = "pegasus" | "unicorn" | "earth";

const ponies: readonly { name: string; kind: Kind }[] = [
  { name: "Rainbow", kind: "pegasus" },
  { name: "Twilight", kind: "unicorn" },
  { name: "Applejack", kind: "earth" },
  { name: "Fluttershy", kind: "pegasus" },
];

@registerExamples()
export class ParadigmsExamples extends ExamplesBase {
  exampleProcedural() {
    const fliers: string[] = [];

    for (const pony of ponies) {
      if (pony.kind === "pegasus") fliers.push(pony.name);
    }

    this.log(fliers.join(", "));
  }

  exampleObjectOriented() {
    abstract class Pony {
      constructor(readonly name: string) {}
      abstract canFly(): boolean;
    }

    class Pegasus extends Pony {
      canFly() {
        return true;
      }
    }

    class Unicorn extends Pony {
      canFly() {
        return false;
      }
    }

    class EarthPony extends Pony {
      canFly() {
        return false;
      }
    }

    const kinds = { pegasus: Pegasus, unicorn: Unicorn, earth: EarthPony };
    const herd = ponies.map(({ name, kind }) => new kinds[kind](name));

    this.log(
      herd
        .filter((pony) => pony.canFly())
        .map((pony) => pony.name)
        .join(", "),
    );
  }

  exampleFunctional() {
    const isPegasus = (pony: { kind: Kind }) => pony.kind === "pegasus";
    const nameOf = (pony: { name: string }) => pony.name;

    this.log(ponies.filter(isPegasus).map(nameOf).join(", "));
  }
}
