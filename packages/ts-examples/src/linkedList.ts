class ListNode<T> {
  constructor(
    public value: T,
    public prev: ListNode<T> | null = null,
    public next: ListNode<T> | null = null,
  ) {}
}

/**
 * Doubly linked list. Indices are zero-based and counted from the first value.
 */
export class LinkedList<T> implements Iterable<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private count = 0;

  /**
   * @param items Values to add in iteration order.
   */
  constructor(items?: Iterable<T>) {
    if (items) for (const item of items) this.addLast(item);
  }

  /** Number of values in the list. */
  get size(): number {
    return this.count;
  }

  /** @returns The first value, or `undefined` when the list is empty. */
  first(): T | undefined {
    return this.head?.value;
  }

  /** @returns The last value, or `undefined` when the list is empty. */
  last(): T | undefined {
    return this.tail?.value;
  }

  /**
   * @param index Position of the value, from 0 to `size - 1`.
   * @returns The value, or `undefined` when the index is out of range.
   */
  at(index: number): T | undefined {
    return this.nodeAt(index)?.value;
  }

  /**
   * @param predicate Called with each value from the first on.
   * @returns The first value the predicate accepts, or `undefined` when none.
   */
  find(predicate: (value: T) => boolean): T | undefined {
    for (const value of this) {
      if (predicate(value)) return value;
    }
    return undefined;
  }

  /** @param value Value to put before the current first one. */
  addFirst(value: T): void {
    const node = new ListNode(value, null, this.head);
    if (this.head) this.head.prev = node;
    else this.tail = node;
    this.head = node;
    this.count++;
  }

  /** @param value Value to put after the current last one. */
  addLast(value: T): void {
    const node = new ListNode(value, this.tail, null);
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    this.count++;
  }

  /**
   * @param index Position of the first inserted value, from 0 to `size`.
   * @param values Values to insert, kept in the given order.
   * @throws {RangeError} When the index is outside 0 to `size`.
   */
  insert(index: number, ...values: T[]): void {
    if (!Number.isInteger(index) || index < 0 || index > this.count) {
      throw new RangeError(`Index ${index} is out of range`);
    }
    for (const value of values) {
      if (index === this.count) {
        this.addLast(value);
      } else {
        const next = this.nodeAt(index)!;
        const node = new ListNode(value, next.prev, next);
        if (next.prev) next.prev.next = node;
        else this.head = node;
        next.prev = node;
        this.count++;
      }
      index++;
    }
  }

  /**
   * @param index Position of the value to replace, from 0 to `size - 1`.
   * @param value The new value.
   * @throws {RangeError} When the index is out of range.
   */
  set(index: number, value: T): void {
    const node = this.nodeAt(index);
    if (!node) throw new RangeError(`Index ${index} is out of range`);
    node.value = value;
  }

  /**
   * @param index Position of the value to remove, from 0 to `size - 1`.
   * @returns The removed value, or `undefined` when the index is out of range.
   */
  removeAt(index: number): T | undefined {
    const node = this.nodeAt(index);
    if (!node) return undefined;
    this.unlink(node);
    return node.value;
  }

  /**
   * @param value Value to remove, compared with `===`.
   * @returns `true` when a value was removed; only the first match goes.
   */
  remove(value: T): boolean {
    for (let node = this.head; node; node = node.next) {
      if (node.value === value) {
        this.unlink(node);
        return true;
      }
    }
    return false;
  }

  /** Removes every value. */
  clear(): void {
    this.head = this.tail = null;
    this.count = 0;
  }

  /** @returns A new list with the same values; changing one list leaves the other alone. */
  clone(): LinkedList<T> {
    return new LinkedList(this);
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let node = this.head; node; node = node.next) yield node.value;
  }

  private nodeAt(index: number): ListNode<T> | null {
    if (!Number.isInteger(index) || index < 0 || index >= this.count) {
      return null;
    }
    let node = this.head!;
    for (let i = 0; i < index; i++) node = node.next!;
    return node;
  }

  private unlink(node: ListNode<T>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    this.count--;
  }
}
