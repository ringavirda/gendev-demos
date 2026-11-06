import { UsageError, type Middleware, type Output } from "@gendev/cli-lib";
import { DomainError } from "../model/errors.js";
import type { Logger } from "../services/ports.js";

/**
 * Turns an error from the rest of the pipeline into a printed line and a status: `UsageError`
 * is `"usage"`, `DomainError` is `"failed"` with its own message, anything else prints
 * `Unexpected error`, logs the stack at error level and is `"failed"`.
 * @param cli where the error line goes.
 * @param logger where the stack of an unexpected error goes.
 */
export function mapErrors(cli: Output, logger: Logger): Middleware {
  return async (context, next) => {
    try {
      await next();
    } catch (error) {
      if (error instanceof UsageError) {
        cli.echoError(error.message);
        context.status = "usage";
      } else if (error instanceof DomainError) {
        cli.echoError(error.message);
        context.status = "failed";
      } else {
        cli.echoError("Unexpected error");
        logger.error(
          error instanceof Error
            ? (error.stack ?? error.message)
            : String(error),
        );
        context.status = "failed";
      }
    }
  };
}

/**
 * Logs `<first selector> took <n> ms` at debug level around the rest of the pipeline, also when
 * it throws. `<n>` is whole milliseconds.
 * @param logger where the line goes.
 */
export function timing(logger: Logger): Middleware {
  return async (context, next) => {
    const started = performance.now();
    try {
      await next();
    } finally {
      const elapsed = Math.round(performance.now() - started);
      logger.debug(`${context.command.selectors[0]} took ${elapsed} ms`);
    }
  };
}
