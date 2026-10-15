export type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "square"; side: number };

export const shapes = [
  { kind: "circle", radius: 2 },
  { kind: "rectangle", width: 3, height: 4 },
  { kind: "square", side: 5 },
] satisfies Shape[];

export function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "square":
      return shape.side ** 2;
  }
}
