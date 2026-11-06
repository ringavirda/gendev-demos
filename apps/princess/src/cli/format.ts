import type { Princess } from "../model/princess.js";

/**
 * @param princess the princess to show.
 * @returns the name line, `Cadance (Mi Amore Cadenza)`, with the old name left out when there is
 * none or it equals the common name without case; then a tab-indented titles line when she has
 * any.
 */
export function formatPrincess(princess: Princess): string[] {
  const { commonName, oldName, titles } = princess;
  const showOld =
    oldName !== undefined &&
    oldName.toLowerCase() !== commonName.value.toLowerCase();
  const lines = [showOld ? `${commonName} (${oldName})` : commonName.value];
  if (titles.size > 0) {
    lines.push(`\t${titles}`);
  }
  return lines;
}
