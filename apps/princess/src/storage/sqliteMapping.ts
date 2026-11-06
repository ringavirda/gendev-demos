import { z } from "zod";
import type { Category } from "../model/category.js";
import { Princess } from "../model/princess.js";
import type { NewPrincessRow, PrincessRow } from "./sqliteTables.js";

const TitlesSchema = z.array(z.string());

/**
 * @param row a stored princess.
 * @returns the princess.
 * @throws {SyntaxError} when the titles column is not JSON.
 * @throws {ZodError} when the titles column is not a list of strings.
 * @throws {DomainError} when the row breaks a model rule.
 */
export function toPrincess(row: PrincessRow): Princess {
  return Princess.of({
    commonName: row.commonName,
    oldName: row.oldName ?? undefined,
    titles: TitlesSchema.parse(JSON.parse(row.titles)),
  });
}

/**
 * @param category the category to store.
 * @returns one row per princess with positions 0 to size - 1.
 */
export function toRows(category: Category): NewPrincessRow[] {
  return category.princesses.map((princess, position) => ({
    category: category.name,
    position,
    commonName: princess.commonName.value,
    oldName: princess.oldName ?? null,
    titles: JSON.stringify(princess.titles.list),
  }));
}
