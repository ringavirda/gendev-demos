import { z } from "zod";
import { Category } from "../model/category.js";
import { Princess } from "../model/princess.js";

export const PrincessRecordSchema = z.object({
  commonName: z.string(),
  oldName: z.string().optional(),
  titles: z.array(z.string()),
});

export const PrincessFileSchema = z.object({
  categories: z.record(z.string(), z.array(PrincessRecordSchema)),
});

export type PrincessRecord = z.infer<typeof PrincessRecordSchema>;
export type PrincessFile = z.infer<typeof PrincessFileSchema>;

/**
 * @param file stored data that passed `PrincessFileSchema`.
 * @returns the categories, in file order.
 * @throws {DomainError} when stored data breaks a model rule, such as an empty or repeated name.
 */
export function toCategories(file: PrincessFile): Category[] {
  return Object.entries(file.categories).map(
    ([name, records]) =>
      new Category(
        name,
        records.map((record) => Princess.of(record)),
      ),
  );
}

/**
 * @param categories the categories to store.
 * @returns the file contents; an old name that is undefined is left out.
 */
export function toFile(categories: readonly Category[]): PrincessFile {
  return {
    categories: Object.fromEntries(
      categories.map((category) => [
        category.name,
        category.princesses.map((princess) => toRecord(princess)),
      ]),
    ),
  };
}

function toRecord(princess: Princess): PrincessRecord {
  const record: PrincessRecord = {
    commonName: princess.commonName.value,
    titles: [...princess.titles.list],
  };
  if (princess.oldName !== undefined) {
    record.oldName = princess.oldName;
  }
  return record;
}
