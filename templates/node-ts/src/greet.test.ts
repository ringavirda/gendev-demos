import { expect, it } from "vitest";

import { greet } from "./greet.js";

it("greets the world", () => {
  expect(greet("world")).toBe("Hello, world!");
});

it("greets the given name", () => {
  expect(greet("Ada")).toBe("Hello, Ada!");
});
