import { greet } from "@repo/greeting";

const name = process.argv[2] ?? "world";

console.log(greet(name));
