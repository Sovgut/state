import { Observer } from "~/common/Observer/Observer.ts";
import { StateDoesNotExist } from "~/errors/StateDoesNotExist.ts";
import { StateInvalidCast } from "~/errors/StateInvalidCast.ts";

type Options<T = unknown> = {
  strict?: boolean;
  fallback?: T;
  cast?: 'string' | 'number' | 'boolean' | 'bigint';
}

export class MemoryState extends Observer {
  private static storage = new Map<string, unknown>();

  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  static get<T = unknown>(key: string, options?: Options<T>): T | undefined;
  static get<T = unknown>(key: string, options: Options<T> = {}): T | undefined {
    const value = MemoryState.storage.get(key);

    if (value === undefined) {
      if (options.strict) {
        throw new StateDoesNotExist(key, 'memory');
      }
      return options.fallback !== undefined ? options.fallback : undefined;
    }

    // Check for empty values when fallback is enabled
    if (options.fallback !== undefined &&
      (value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && value !== null && Object.keys(value).length === 0))) {
      return options.fallback;
    }

    // Apply casting if specified
    if (options.cast) {
      try {
        switch (options.cast) {
          case 'string':
            return String(value) as T;
          case 'number':
            return Number(value) as T;
          case 'boolean':
            return Boolean(value) as T;
          case 'bigint':
            return BigInt(String(value)) as T;
        }
      } catch {
        if (options.strict) {
          throw new StateInvalidCast(String(value), options.cast);
        }
        return options.fallback !== undefined ? options.fallback : undefined;
      }
    }

    return value as T;
  }

  static set<T = unknown>(key: string, value: T): void {
    MemoryState.storage.set(key, value);
    MemoryState.emit(key, value);
  }

  static remove(key: string): void {
    MemoryState.storage.delete(key);
    MemoryState.emit(key, null);
  }

  static clear(): void {
    const keys = Array.from(MemoryState.storage.keys());
    MemoryState.storage.clear();

    keys.forEach((key) => MemoryState.emit(key, null));
  }

  static has(key: string): boolean {
    return MemoryState.storage.has(key);
  }
}