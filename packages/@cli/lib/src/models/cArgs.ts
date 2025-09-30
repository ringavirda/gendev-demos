export interface CArgs {
  raw: Array<string>;
  // Most commands use this convention.
  selector: string;
  args: Array<string>;

  // Options may be added here.
}
