import type { CLI } from "@gendev/cli-lib";
import { DomainError } from "../model/errors.js";
import { Princess, type PrincessChanges } from "../model/princess.js";
import { Titles } from "../model/titles.js";

const oldNamePrompt = "Old Name (optional):";
const titlesPrompt = "Titles (optional, comma separated):";

/**
 * Asks for the optional fields of a new princess. An unanswered prompt, including the end of
 * input, counts as an empty answer.
 * @param cli where the prompts go.
 * @param name the common name of the new princess.
 * @throws {ValidationError} when the name is blank or longer than 40 characters.
 */
export async function askNewPrincess(
  cli: CLI,
  name: string,
): Promise<Princess> {
  cli.echoWarn("Please provide additional information:");
  const oldName = (await cli.read(oldNamePrompt)) ?? "";
  const titles = (await cli.read(titlesPrompt)) ?? "";
  return Princess.of({
    commonName: name,
    oldName,
    titles: Titles.parse(titles).list,
  });
}

/**
 * Asks for the fields of a princess that may change. An empty answer, or the end of input,
 * leaves the field out of the result.
 * @param cli where the prompts go.
 */
export async function askChanges(cli: CLI): Promise<PrincessChanges> {
  cli.echoWarn("Please provide additional information:");
  const oldName = ((await cli.read(oldNamePrompt)) ?? "").trim();
  const titles = ((await cli.read(titlesPrompt)) ?? "").trim();
  const changes: { oldName?: string; titles?: readonly string[] } = {};
  if (oldName !== "") {
    changes.oldName = oldName;
  }
  if (titles !== "") {
    changes.titles = Titles.parse(titles).list;
  }
  return changes;
}

/**
 * Asks the user to confirm an operation.
 * @param cli where the prompt goes.
 * @param operation the verb shown in the question, such as `remove`.
 * @param name the princess the operation is about.
 * @throws {DomainError} `Operation aborted.` unless the answer is `yes` without case; the end of
 * input is not a yes.
 */
export async function confirm(
  cli: CLI,
  operation: string,
  name: string,
): Promise<void> {
  cli.echoWarn(
    `You are about to ${operation} the princess ${name}, do you confirm?`,
  );
  const answer = (await cli.read("(yes/any) >")) ?? "";
  if (answer.trim().toLowerCase() !== "yes") {
    throw new DomainError("Operation aborted.");
  }
}
