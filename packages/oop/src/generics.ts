/* eslint-disable @typescript-eslint/no-this-alias */
import { ExamplesBase, registerExamples } from "@demos/prefabs";

@registerExamples()
export class GenericExamples extends ExamplesBase {
  exampleTemplate() {
    const context = this;

    class Container<T> {
      private _internal: Array<T> = [];

      constructor(starter: Array<T>);
      constructor(starter: T);
      constructor(...starter: Array<T>);
      constructor(starter: any) {
        if (starter instanceof Array) this._internal = starter;
        else this._internal.push(starter);
      }

      public get(index: number): T {
        return this._internal[index];
      }
      public add(item: T): void {
        this._internal.push(item);
      }
      public remove(id: T | number): void {
        let index = id as number;
        if (!Number.isInteger(id)) {
          index = this._internal.indexOf(id as T);
        }
        this._internal.splice(index, 1);
      }

      public print(): void {
        context.log(`[ ${this._internal.join(", ")} ]`);
      }
    }

    const cont0 = new Container(0);
    cont0.add(1);
    cont0.add(2);
    cont0.print();

    this.separator();

    const cont1 = new Container(["first", "second"]);
    cont1.add("third");
    cont1.remove(1);
    cont1.print();

    this.separator();

    const cont2 = new Container(...Array(5).keys());
    this.log(`get(2): ${cont2.get(2)}`);
    cont2.print();
  }

  public exampleConstraints() {
    const context = this;

    interface ISomething {
      some(): void;
    }

    class Constrained<T extends string | ISomething> {
      public print(stuff: T) {
        context.log(stuff as unknown as string); // This is a workaround.
      }
    }

    class MyString extends String implements ISomething {
      some(): void {}
    }

    const constrained = new Constrained();
    const myString = new MyString("Hey my string!");
    constrained.print(myString);
    // constrained.print("Normal string.") // Compiler will complain.

    // const functionConstrained = <T extends Function>(func: T) => {};
    // const functionConstrainedLiteral = <T extends () => void>(func: T) => {};

    // const literalConstrained = <T extends "first" | "second">(literal: T) => {};

    // const defaultConstrained = <T = string>(message: T) => {};

    // const multipleVarConstrained = <T, V>(first: T, second: V) => {};
  }
}
