import { Observer } from "~/common/Observer/Observer.ts";
import { StateDoesNotExist } from "~/errors/StateDoesNotExist.ts";
import { StateInvalidCast } from "~/errors/StateInvalidCast.ts";

type Options<T = unknown> = {
  strict?: boolean;
  fallback?: T;
  cast?: 'string' | 'number' | 'boolean' | 'bigint';
}

export class LocalState extends Observer {
  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  static get<T = unknown>(key: string, options?: Options<T>): T | undefined;
  static get<T = unknown>(key: string, options: Options<T> = {}): T | undefined {
    const item = localStorage.getItem(key);

    if (item === null) {
      if (options.strict) {
        throw new StateDoesNotExist(key, 'localStorage');
      }
      return options.fallback !== undefined ? options.fallback : undefined;
    }

    try {
      let parsed = JSON.parse(item) as T;

      // Check for empty values when fallback is enabled
      if (options.fallback !== undefined &&
        (parsed === null ||
          parsed === undefined ||
          parsed === '' ||
          (Array.isArray(parsed) && parsed.length === 0) ||
          (typeof parsed === 'object' && Object.keys(parsed).length === 0))) {
        return options.fallback;
      }

      // Apply casting if specified
      if (options.cast) {
        switch (options.cast) {
          case 'string':
            parsed = String(parsed) as T;
            break;
          case 'number':
            parsed = Number(parsed) as T;
            break;
          case 'boolean':
            parsed = Boolean(parsed) as T;
            break;
          case 'bigint':
            parsed = BigInt(String(parsed)) as T;
            break;
        }
      }

      return parsed;
    } catch {
      // If parsing fails, try to cast the raw string value if cast option is specified
      if (options.cast) {
        try {
          switch (options.cast) {
            case 'string':
              return item as T;
            case 'number':
              return Number(item) as T;
            case 'boolean':
              return (item === 'true' || item === '1') as T;
            case 'bigint':
              return BigInt(item) as T;
          }
        } catch {
          // If casting fails, return fallback or undefined or throw based on strict mode
          if (options.strict) {
            throw new StateInvalidCast(key, 'localStorage', item, options.cast);
          }
          return options.fallback !== undefined ? options.fallback : undefined;
        }
      }

      // If no casting and parsing failed, return the raw string value
      return item as T;
    }
  }

  static set<T = unknown>(key: string, value: T): void {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    LocalState.emit(key, value);
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
    LocalState.emit(key, null);
  }

  static clear(): void {
    Object.keys(localStorage).forEach(key => {
      localStorage.removeItem(key);
      LocalState.emit(key, null);
    });
  }

  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}