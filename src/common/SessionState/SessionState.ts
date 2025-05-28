import { Observer } from "~/common/Observer/Observer.ts";
import { StateDoesNotExist } from "~/errors/StateDoesNotExist.ts";
import { StateInvalidCast } from "~/errors/StateInvalidCast.ts";

type Options<T = unknown> = {
  strict?: boolean;
  fallback?: T;
  cast?: 'string' | 'number' | 'boolean' | 'bigint';
}

export class SessionState extends Observer {
  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  static get<T = unknown>(key: string, options?: Options<T>): T | undefined;
  static get<T = unknown>(key: string, options: Options<T> = {}): T | undefined {
    const item = sessionStorage.getItem(key);

    if (item === null) {
      if (options.strict) {
        throw new StateDoesNotExist(key, 'sessionStorage');
      }
      return options.fallback !== undefined ? options.fallback : undefined;
    }

    try {
      let parsed = JSON.parse(item) as T;

      if (options.fallback !== undefined &&
        (parsed === null ||
          parsed === undefined ||
          parsed === '' ||
          (Array.isArray(parsed) && parsed.length === 0) ||
          (typeof parsed === 'object' && Object.keys(parsed).length === 0))) {
        return options.fallback;
      }

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
          if (options.strict) {
            throw new StateInvalidCast(key, 'sessionStorage', item, options.cast);
          }
          return options.fallback !== undefined ? options.fallback : undefined;
        }
      }

      return item as T;
    }
  }

  static set<T = unknown>(key: string, value: T): void {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
    SessionState.emit(key, value);
  }

  static remove(key: string): void {
    sessionStorage.removeItem(key);
    SessionState.emit(key, null);
  }

  static clear(): void {
    Object.keys(sessionStorage).forEach(key => {
      sessionStorage.removeItem(key);
      SessionState.emit(key, null);
    });
  }

  static has(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }
}