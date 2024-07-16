import { IStrategyOptions } from "@/types";

export function serialize<Fallback = unknown>(
  value: string | undefined | null,
  options?: IStrategyOptions<Fallback>,
): Fallback {
  if (typeof value === "undefined") return options?.fallback as Fallback;
  if (value === null) {
    return options?.fallback as Fallback;
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
