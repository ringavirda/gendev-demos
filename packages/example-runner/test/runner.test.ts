import { stripVTControlCharacters } from "node:util";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ExamplesBase,
  example,
  getExamples,
  registerExamples,
  runExamples,
} from "../src/index.js";

function mark(title: string, cls: { prototype: ExamplesBase }, key: string) {
  const descriptor = Object.getOwnPropertyDescriptor(cls.prototype, key)!;
  example(title)(cls.prototype, key, descriptor);
}

describe("runner", () => {
  let lines: string[];

  beforeEach(() => {
    lines = [];
    vi.spyOn(console, "log").mockImplementation((message: string) => {
      lines.push(stripVTControlCharacters(message));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps declaration order for marked and named examples", () => {
    class Demo extends ExamplesBase {
      exampleB(): void {}
      helper(): void {}
      exampleA(): void {}
      marked(): void {}
    }
    mark("Titled A", Demo, "exampleA");
    mark("Only marked", Demo, "marked");
    registerExamples()(Demo);

    expect(getExamples(Demo).map((e) => e.key)).toEqual([
      "exampleB",
      "exampleA",
      "marked",
    ]);
  });

  it("titles come from the mark or the name", () => {
    class Demo extends ExamplesBase {
      exampleAsConst(): void {}
      other(): void {}
    }
    mark("Titled", Demo, "other");
    registerExamples()(Demo);

    expect(getExamples(Demo).map((e) => e.title)).toEqual([
      "As const",
      "Titled",
    ]);
  });

  it("reports a class without examples", () => {
    class Empty extends ExamplesBase {}
    registerExamples()(Empty);

    expect(runExamples([Empty])).toBe(true);
    expect(lines).toEqual(["Empty: no examples"]);
  });

  it("reports a throwing example and runs the next", () => {
    class Demo extends ExamplesBase {
      exampleOne(): void {
        this.log("one");
      }
      exampleTwo(): void {
        throw new Error("boom");
      }
      exampleThree(): void {
        this.log("three");
      }
    }
    registerExamples()(Demo);

    expect(runExamples([Demo])).toBe(false);
    expect(lines).toContain(" ! Error: boom");
    expect(lines).toContain(" | three");
  });

  it("prints the compact layout", () => {
    class Demo extends ExamplesBase {
      exampleFirst(): void {
        this.log("one");
      }
      exampleSecond(): void {
        this.log({ a: 1 });
      }
    }
    registerExamples()(Demo);

    runExamples([Demo]);
    expect(lines).toEqual([
      "Demo: 2 examples",
      "",
      "First",
      " | one",
      "",
      "Second",
      " | { a: 1 }",
    ]);
  });

  it("prefixes every line and the separator", () => {
    class Demo extends ExamplesBase {
      exampleMulti(): void {
        this.log("a\nb");
        this.separator();
      }
    }
    registerExamples()(Demo);

    runExamples([Demo]);
    expect(lines.slice(-3)).toEqual([
      " | a",
      " | b",
      " | ====================",
    ]);
  });

  it("separates classes with an empty line", () => {
    class First extends ExamplesBase {
      exampleOne(): void {}
    }
    class Second extends ExamplesBase {
      exampleTwo(): void {}
    }
    registerExamples()(First);
    registerExamples()(Second);

    runExamples([First, Second]);
    expect(lines[lines.indexOf("Second: 1 example") - 1]).toBe("");
  });
});
