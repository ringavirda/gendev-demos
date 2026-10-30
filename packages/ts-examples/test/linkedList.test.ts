import { describe, expect, it } from "vitest";

import { LinkedList } from "../src/linkedList.js";

describe("LinkedList", () => {
  it("starts empty", () => {
    const list = new LinkedList<number>();

    expect(list.size).toBe(0);
    expect(list.first()).toBeUndefined();
    expect(list.last()).toBeUndefined();
    expect([...list]).toEqual([]);
  });

  it("adds at both ends", () => {
    const list = new LinkedList<string>();
    list.addLast("b");
    list.addLast("c");
    list.addFirst("a");

    expect([...list]).toEqual(["a", "b", "c"]);
    expect(list.size).toBe(3);
    expect(list.first()).toBe("a");
    expect(list.last()).toBe("c");
  });

  it("keeps the back links when adding first", () => {
    const list = new LinkedList<string>();
    list.addFirst("b");
    expect(list.last()).toBe("b");
    list.addFirst("a");
    list.removeAt(1);

    expect(list.last()).toBe("a");
    expect([...list]).toEqual(["a"]);
  });

  it("inserts at the start, middle and end", () => {
    const list = new LinkedList<number>([2, 4]);
    list.insert(0, 1);
    list.insert(2, 3);
    list.insert(4, 5);

    expect([...list]).toEqual([1, 2, 3, 4, 5]);
    expect(list.size).toBe(5);
    expect(list.last()).toBe(5);
    expect(() => list.insert(-1, 0)).toThrow(RangeError);
    expect(() => list.insert(1.5, 0)).toThrow(RangeError);
    expect(() => list.insert(list.size + 1, 0)).toThrow(RangeError);
  });

  it("inserts several values in order", () => {
    const list = new LinkedList<number>([1, 5]);
    list.insert(1, 2, 3, 4);

    expect([...list]).toEqual([1, 2, 3, 4, 5]);
    expect(list.size).toBe(5);
  });

  it("removes by index and by value", () => {
    const list = new LinkedList<string>(["a", "b", "c", "b"]);

    expect(list.removeAt(1)).toBe("b");
    expect([...list]).toEqual(["a", "c", "b"]);
    expect(list.removeAt(3)).toBeUndefined();
    expect(list.removeAt(-1)).toBeUndefined();
    expect(list.remove("b")).toBe(true);
    expect(list.remove("z")).toBe(false);
    expect([...list]).toEqual(["a", "c"]);

    expect(list.remove("a")).toBe(true);
    expect(list.remove("c")).toBe(true);
    expect(list.size).toBe(0);
    expect(list.first()).toBeUndefined();
    expect(list.last()).toBeUndefined();
  });

  it("reads out of range as undefined", () => {
    const list = new LinkedList<number>([1, 2]);

    expect(list.at(1)).toBe(2);
    expect(list.at(2)).toBeUndefined();
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0.5)).toBeUndefined();
  });

  it("sets by index", () => {
    const list = new LinkedList<number>([1, 2, 3]);
    list.set(1, 20);

    expect([...list]).toEqual([1, 20, 3]);
    expect(() => list.set(3, 0)).toThrow(RangeError);
    expect(() => list.set(-1, 0)).toThrow(RangeError);
  });

  it("iterates with for...of and spread", () => {
    const list = new LinkedList<number>([1, 2, 3]);
    const seen: number[] = [];
    for (const value of list) seen.push(value);

    expect(seen).toEqual([1, 2, 3]);
    expect([...list]).toEqual([1, 2, 3]);
  });

  it("builds from any iterable", () => {
    const list = new LinkedList<string>(new Set(["a", "b", "a"]));

    expect([...list]).toEqual(["a", "b"]);
    expect(list.size).toBe(2);
  });

  it("clones independently", () => {
    const list = new LinkedList<number>([1, 2]);
    const copy = list.clone();
    copy.addLast(3);
    list.set(0, 10);

    expect([...list]).toEqual([10, 2]);
    expect([...copy]).toEqual([1, 2, 3]);
  });

  it("finds by predicate", () => {
    const list = new LinkedList<number>([1, 2, 3, 4]);

    expect(list.find((value) => value > 2)).toBe(3);
    expect(list.find((value) => value > 9)).toBeUndefined();
  });

  it("clears", () => {
    const list = new LinkedList<number>([1, 2]);
    list.clear();

    expect(list.size).toBe(0);
    expect(list.first()).toBeUndefined();
    expect(list.last()).toBeUndefined();
    list.addLast(7);
    expect([...list]).toEqual([7]);
  });
});
