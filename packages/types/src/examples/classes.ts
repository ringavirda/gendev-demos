/* eslint-disable @typescript-eslint/no-this-alias */
import { ExamplesBase, registerExamples } from "../examples.js";

@registerExamples()
export class ClassExamples extends ExamplesBase {
  exampleConstructor(): void {
    const context = this;

    class Princess {
      private _name: string;
      private _surname: string;

      constructor(raw: string) {
        const parts = raw.trim().split(" ");
        this._surname = parts[0];
        this._name = parts[1];
        context.log("Princess was created.");
      }

      public fullName(): string {
        return `${this._surname} ${this._name}`;
      }
    }

    // Create instance.
    const princess = new Princess("Twilight Sparkle");

    this.log(`instance: ${princess}`);
    this.log(`json: ${JSON.stringify(princess)}`);
    this.log(`fullName: ${princess.fullName()}`);
  }

  exampleInheritance(): void {
    const context = this;

    class Pony {
      protected _name: string;

      constructor(name: string) {
        this._name = name;
      }

      public run(): void {
        context.log(`${this._name}: she runs!`);
      }
    }

    class Pegasus extends Pony {
      constructor(name: string) {
        super(name);
      }

      public fly(): void {
        context.log(`${this._name}: she flies!`);
      }
    }

    const pinkie = new Pony("Pinkie Pie");
    const rainbow = new Pegasus("Rainbow Dash");

    pinkie.run();

    rainbow.run();
    rainbow.fly();

    // No diamond inheritance.
    this.separator();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Unicorn extends Pony {
      constructor(name: string) {
        super(name);
      }

      public magic(): void {
        context.log(`${this._name}: she magics!`);
      }
    }

    // This is not possible.
    // class Alicorn extends Pony, Pegasus, Unicorn {}

    // Use interfaces instead.

    interface IFlier {
      fly(): void;
    }
    interface IMagicUser {
      magic(): void;
    }

    class Alicorn extends Pony implements IFlier, IMagicUser {
      constructor(name: string) {
        super(name);
      }

      public fly(): void {
        context.log(`${this._name}: she breaks sound barrier!`);
      }
      public magic(): void {
        context.log(`${this._name}: she is a cheater!`);
      }
    }

    const fallenstar = new Alicorn("Fallenstar");
    fallenstar.run();
    fallenstar.fly();
    fallenstar.magic();
  }

  examplePolymorphism(): void {
    const context = this;

    abstract class Flier {
      constructor(protected _name: string) {}
      abstract fly(): void;
      // abstract fly(distance: number): void; // Static poly is not supported.
    }

    class Pegasus extends Flier {
      public override fly(): void {
        context.log(`${this._name}: she flies fast!`);
      }
    }

    class Griffon extends Flier {
      public override fly(): void {
        context.log(`${this._name}: she flies with agility!`);
      }
    }

    const rainbow = new Pegasus("Rainbow Dash");
    const gabby = new Griffon("Gabriela");

    const fliers: Array<Flier> = [rainbow, gabby];
    fliers.forEach((fl) => fl.fly());
  }
}
