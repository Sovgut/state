import { IStrategyOptions } from "@/types";

export function serialize<Fallback = unknown>(value: string | undefined | null, options?: IStrategyOptions<Fallback>): Fallback {
  const fallback = options?.fallback ?? value as Fallback;

  if (typeof value === "undefined" || value === undefined) return fallback;
  if (value === null) {
    return fallback;
  }

  if (!options?.allowAnyString) {
    if (value === 'undefined') return fallback;
    if (value === 'null') return fallback;
    if (value === 'NaN') return fallback;
  }

  const type = options?.cast ?? typeof options?.fallback;
  switch (type) {
    case "bigint": {
      return BigInt(value) as Fallback;
    }
    case "boolean": {
      return (value.toLowerCase() === ("true" as unknown)) as Fallback;
    }
    case "number": {
      return Number(value) as Fallback;
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
}
