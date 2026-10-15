import { pick } from "./pick.js";
import { area, shapes } from "./shapes.js";

for (const shape of shapes) {
  console.log(`${shape.kind}: ${area(shape).toFixed(2)}`);
}

console.log(pick({ name: "ts7", major: 7, stable: true }, ["name", "major"]));
