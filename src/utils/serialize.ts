import { IStrategyOptions } from "@/types";

export function serialize<Fallback = unknown>(value: string | undefined | null, options?: IStrategyOptions<Fallback>): Fallback {
  // Check empty values
  if (typeof value === "undefined") return options?.fallback as Fallback;
  if (value === undefined) return options?.fallback as Fallback;
  if (value === null) return options?.fallback as Fallback;

  // Check falsy-true values
  if (!options?.allowAnyString) {
    if (value === 'undefined') return options?.fallback as Fallback;
    if (value === 'null') return options?.fallback as Fallback;
    if (value === 'NaN') return options?.fallback as Fallback;
  }

  // Get target type parsing
  const type = options?.cast ?? typeof options?.fallback ?? undefined;

  // Parse value
  try {
    switch (type) {
      case "bigint": {
        return BigInt(value) as Fallback;
      }
      case "boolean": {
        const parsed = value.toLowerCase()

        if (parsed !== "true" && parsed !== "false") {
          return options?.fallback as Fallback;
        }

        return (parsed === "true") as Fallback;
      }
      case "number": {
        const parsed = Number(value);

        if (Number.isNaN(parsed)) {
          return options?.fallback as Fallback;
        }

        return parsed as Fallback;
      }
      case "object": {
        return JSON.parse(value) as Fallback;
      }
      case "string": {
        return value as Fallback;
      }
      default: {
        return value as Fallback;
      }
    }
  } catch (error) {
    return options?.fallback as Fallback;
  }
}
