import { ExamplesBase, registerExamples } from "@gendev/example-runner";

@registerExamples()
export class TypeLevelExamples extends ExamplesBase {
  exampleMappedTypes(): void {
    interface Princess {
      name: string;
      surname: string;
      powerRank: number;
    }

    type MyPartial<T> = { [K in keyof T]?: T[K] };
    type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

    const draft: MyPartial<Princess> = { name: "Twilight" };
    this.log(draft);

    const celestia: MyReadonly<Princess> = {
      name: "Celestia",
      surname: "Sparkle",
      powerRank: 100,
    };
    this.log(celestia);

    // @ts-expect-error: every property of MyReadonly is readonly
    celestia.powerRank = 1;
  }

  exampleKeyRemapping(): void {
    interface Princess {
      name: string;
      surname: string;
      powerRank: number;
    }

    type Getters<T> = {
      [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
    };

    const getters: Getters<Princess> = {
      getName: () => "Twilight",
      getSurname: () => "Sparkle",
      getPowerRank: () => 12,
    };
    this.log(getters.getName());
    this.log(getters.getPowerRank());

    // @ts-expect-error: the keys were renamed, there is no name getter
    this.log(typeof getters.name);
  }

  exampleConditionalTypes(): void {
    type IsString<T> = T extends string ? "yes" : "no";
    type WholeIsString<T> = [T] extends [string] ? "yes" : "no";

    const forString: IsString<string>[] = ["yes"];
    const forNumber: IsString<number>[] = ["no"];
    this.log([forString, forNumber]);

    const distributed: IsString<string | number>[] = ["yes", "no"];
    const whole: WholeIsString<string | number>[] = ["no"];
    this.log([distributed, whole]);

    // @ts-expect-error: IsString<number> is "no", never "yes"
    forNumber.push("yes");
  }

  exampleInfer(): void {
    type MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never;
    type ElementOf<A> = A extends readonly (infer E)[] ? E : never;

    const crown = (): string => "Luna";
    const owners: MyReturnType<typeof crown>[] = [crown()];
    const ranks: ElementOf<number[]>[] = [12, 100];
    this.log([owners, ranks]);

    // @ts-expect-error: the element type of number[] is number
    ranks.push("high");
  }

  exampleTemplateLiterals(): void {
    type Aspect = "shine" | "fade";
    type EventName = `on${Capitalize<Aspect>}`;

    const events: EventName[] = ["onShine", "onFade"];
    this.log(events);

    // @ts-expect-error: onGlow is not built from an aspect
    events.push("onGlow");
  }

  exampleIndexedLookup(): void {
    type Princesses = {
      day: "Celestia";
      night: "Luna";
      love: "Cadance";
      friendship: "Twilight";
    };

    type GetPrincessMeta<T extends keyof Princesses> = Princesses[T];

    const friendship: GetPrincessMeta<"friendship"> = "Twilight";
    const night: GetPrincessMeta<"night"> = "Luna";
    this.log([friendship, night]);

    // @ts-expect-error: "dawn" is not a key of Princesses
    void ("Celestia" as GetPrincessMeta<"dawn">);
  }
}
