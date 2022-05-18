import { SourceOption } from "../types";
import { sources } from "../sources";

export function getOptions(): SourceOption[] {
  return Object.values(sources).map(({ type, label, fields }) => ({
    type,
    label,
    fields
  }));
}
