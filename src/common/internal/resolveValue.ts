import { StateDoesNotExist } from "~/errors/StateDoesNotExist.ts";
import { StateInvalidCast } from "~/errors/StateInvalidCast.ts";

export type CastTarget = "string" | "number" | "boolean" | "bigint";

/**
 * Configuration options for retrieving values from state.
 * @template T - The expected type of the value
 */
export type Options<T = unknown> = {
  /** If true, throws an error when the key doesn't exist or a cast fails. */
  strict?: boolean;
  /** Default value returned when the key doesn't exist or holds an empty value. */
  fallback?: T;
  /** Cast the stored value to a specific primitive type. */
  cast?: CastTarget;
};

/**
 * Result of fetching a raw value from the underlying storage.
 * `found: false` means the key was absent (vs holding an explicit null/empty value).
 */
export type FetchResult = { found: true; value: unknown } | { found: false };

/**
 * Treats only plain objects as "empty-substitutable".
 * Date/Map/Set/class-instances are NOT considered empty even when
 * `Object.keys()` returns []. This fixes a long-standing bug where
 * legitimately-stored Date objects were replaced with the fallback.
 */
function isEmptyish(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto === null || proto === Object.prototype) {
      return Object.keys(value as object).length === 0;
    }
  }
  return false;
}

/**
 * Casts a value to the requested primitive type.
 * Throws on impossible casts (e.g. BigInt("abc"), Number("abc")).
 * Special-cases boolean string parsing so "false"/"0"/"" are correctly false.
 */
function castValue(value: unknown, target: CastTarget): unknown {
  switch (target) {
    case "string": {
      if (value === null || value === undefined) return String(value);
      if (typeof value === "object") {
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }
      return String(value);
    }

    case "number": {
      if (typeof value === "number") return value;
      if (typeof value === "bigint") return Number(value);
      if (typeof value === "boolean") return value ? 1 : 0;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "")
          throw new Error("Cannot cast empty string to number");
        const n = Number(trimmed);
        if (Number.isNaN(n))
          throw new Error(`Cannot cast "${value}" to number`);
        return n;
      }
      throw new Error(`Cannot cast ${typeof value} to number`);
    }

    case "boolean": {
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value !== 0 && !Number.isNaN(value);
      if (typeof value === "bigint") return value !== 0n;
      if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        if (v === "true" || v === "1") return true;
        if (v === "false" || v === "0" || v === "") return false;
        // Any other non-empty string is truthy, matching JS coercion rules
        return true;
      }
      return Boolean(value);
    }

    case "bigint": {
      if (typeof value === "bigint") return value;
      if (typeof value === "boolean") return value ? 1n : 0n;
      if (typeof value === "number") {
        if (!Number.isFinite(value) || !Number.isInteger(value)) {
          throw new Error(`Cannot cast non-integer number to bigint: ${value}`);
        }
        return BigInt(value);
      }
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "")
          throw new Error("Cannot cast empty string to bigint");
        return BigInt(trimmed);
      }
      throw new Error(`Cannot cast ${typeof value} to bigint`);
    }
  }
}

/**
 * Centralised value-resolution logic shared by every storage implementation.
 *
 * Order of operations:
 *  1. If not found: throw in strict mode, otherwise return fallback (or undefined).
 *  2. If value is "empty-ish" AND a fallback is provided: return fallback.
 *  3. If a cast is requested: try to cast; on failure throw in strict mode,
 *     otherwise return fallback.
 */
export function resolveValue<T>(
  result: FetchResult,
  options: Options<T>,
  storageName: string,
  key: string,
): T | undefined {
  if (!result.found) {
    if (options.strict) {
      throw new StateDoesNotExist(key, storageName);
    }
    return options.fallback;
  }

  const value = result.value;

  if (options.fallback !== undefined && isEmptyish(value)) {
    return options.fallback;
  }

  if (!options.cast) {
    return value as T;
  }

  try {
    return castValue(value, options.cast) as T;
  } catch {
    if (options.strict) {
      throw new StateInvalidCast(key, storageName, value, options.cast);
    }
    return options.fallback;
  }
}
