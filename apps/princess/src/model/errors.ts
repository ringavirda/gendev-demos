/** A broken rule of the princess domain; the message is written for the user. */
export class DomainError extends Error {
  override name = "DomainError";
}

/** Input that is not a valid value, such as a blank or an over-long name. */
export class ValidationError extends DomainError {
  override name = "ValidationError";
}

/** A princess, an index or a category that does not exist. */
export class NotFoundError extends DomainError {
  override name = "NotFoundError";
}

/** A princess that is already in the category. */
export class DuplicateError extends DomainError {
  override name = "DuplicateError";
}
