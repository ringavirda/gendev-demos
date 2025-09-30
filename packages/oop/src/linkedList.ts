import { ExamplesBase, registerExamples } from "@demos/prefabs";

@registerExamples()
export class LinkedListExamples extends ExamplesBase {
  exampleUsage(): void {
    const list = new LinkedList<string>();

    // Add-last-get tests

    list.addLast("first");
    list.addLast("second");
    list.addLast("third");

    console.log(list.at(0));
    console.log(list.at(1));
    console.log(list.at(2));

    console.log();
    // Clear-list tests

    list.clear();
    console.log(list);

    console.log();
    // Add-first tests

    list.addFirst("first");
    list.addFirst("second");
    list.addFirst("third");

    console.log(list.at(0));
    console.log(list.at(1));
    console.log(list.at(2));

    console.log();
    // Insert tests

    list.insert(1, "inserted");
    console.log(list.at(0));
    console.log(list.at(1));
    console.log(list.at(2));
    console.log(list.at(3));

    console.log();
    // Change tests

    list.change(0, "changed");
    console.log(list.at(0));
    console.log(list.at(1));
    console.log(list.at(2));
    console.log(list.at(3));
  }
}

class Node<T> {
  constructor(
    public prev: Node<T> | null,
    public next: Node<T> | null,
    public value: T,
    public index: number,
  ) {}
}

class LinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  first() {
    return this.head?.value;
  }
  last() {
    return this.tail?.value;
  }

  at(n: number): T | undefined {
    const node = this.getNodeAt(n);
    return node?.value;
  }

  find(predicate: (data: T) => boolean): T | undefined {
    let node = this.head;
    while (node) {
      if (predicate(node.value)) return node.value;
      node = node.next;
    }
    return undefined;
  }

  addFirst(data: T) {
    const newNode = new Node(null, this.head, data, 0);
    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      this.updateIndices(this.head, 1);
      this.head.prev = newNode;
      this.head = newNode;
    }
  }

  addLast(data: T) {
    const newNode = new Node(
      this.tail,
      null,
      data,
      this.tail ? this.tail.index + 1 : 0,
    );
    if (!this.tail) {
      this.head = this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
  }

  insert(n: number, ...items: T[]) {
    if (!items.length) return;
    if (!this.head && n === 0) {
      items.forEach((item) => this.addLast(item));
      return;
    }
    if (this.tail && n === this.tail.index + 1) {
      items.forEach((item) => this.addLast(item));
      return;
    }
    const node = this.getNodeAt(n);
    if (node) {
      let prev = node.prev;
      items.forEach((item, i) => {
        const newNode = new Node(prev, null, item, n + i);
        if (prev) prev.next = newNode;
        prev = newNode;
        if (i === 0) node.prev = newNode;
      });
      prev!.next = node;
      this.updateIndices(node, items.length);
      if (n === 0) this.head = node.prev;
    }
  }

  size() {
    return this.tail ? this.tail.index + 1 : 0;
  }
  clear() {
    this.head = this.tail = null;
  }
  clone(): LinkedList<T> {
    return new LinkedList<T>();
  }

  toArray(): T[] {
    const arr: T[] = [];
    let node = this.head;
    while (node) {
      arr.push(node.value);
      node = node.next;
    }
    return arr;
  }

  change(n: number, data: T) {
    const node = this.getNodeAt(n);
    if (node) node.value = data;
  }

  remove(data: T) {
    let node = this.head;
    while (node) {
      if (node.value === data) {
        this.removeNode(node);
        return;
      }
      node = node.next;
    }
  }

  removeAt(n: number) {
    const node = this.getNodeAt(n);
    if (node) this.removeNode(node);
  }

  removeFirst() {
    this.removeAt(0);
  }
  removeLast() {
    this.removeAt(this.size() - 1);
  }

  private getNodeAt(n: number): Node<T> | null {
    let node = this.head;
    while (node && node.index !== n) node = node.next;
    return node;
  }

  private updateIndices(start: Node<T> | null, delta: number) {
    let node = start;
    while (node) {
      node.index += delta;
      node = node.next;
    }
  }

  private removeNode(node: Node<T>) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) {
      node.next.prev = node.prev;
      this.updateIndices(node.next, -1);
    } else {
      this.tail = node.prev;
    }
  }
}
