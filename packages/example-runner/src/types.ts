export type Examples = Map<string, (() => void) | null>;

export abstract class ExamplesBase {
  protected log(message: string | unknown): void {
    if (typeof message === "string") {
      message.split("\n").forEach((line) => {
        console.log(` | ${line}`);
      });
    } else {
      console.log(` | ${message}`);
    }
  }

  protected separator(): void {
    console.log("=".repeat(20));
  }
}
