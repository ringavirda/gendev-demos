import type { LogLevel, Logger } from "../../src/services/ports.js";

export class RecordingLogger implements Logger {
  readonly lines: [LogLevel, string][] = [];

  debug(message: string): void {
    this.lines.push(["debug", message]);
  }

  info(message: string): void {
    this.lines.push(["info", message]);
  }

  warn(message: string): void {
    this.lines.push(["warn", message]);
  }

  error(message: string): void {
    this.lines.push(["error", message]);
  }
}
