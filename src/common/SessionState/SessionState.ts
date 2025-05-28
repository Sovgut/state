import { Observer } from "~/common/Observer/Observer.ts";
import { StateDoesNotExist } from "~/errors/StateDoesNotExist.ts";
import { StateInvalidCast } from "~/errors/StateInvalidCast.ts";

/**
 * Configuration options for retrieving values from state
 * @template T - The expected type of the value
 */
type Options<T = unknown> = {
  /** If true, throws an error when the key doesn't exist */
  strict?: boolean;
  /** Default value to return when the key doesn't exist or has an empty value */
  fallback?: T;
  /** Cast the value to a specific type */
  cast?: 'string' | 'number' | 'boolean' | 'bigint';
}

/**
 * Session storage state management class that persists data using the browser's sessionStorage API.
 * Data persists only for the duration of the page session (until the tab is closed).
 * Extends Observer to provide event emission capabilities.
 */
export class SessionState extends Observer {
  /**
   * Retrieves a value from session storage with strict type checking
   * @template T - The expected type of the value
   * @param key - The key to retrieve
   * @param options - Options with strict mode enabled
   * @returns The value associated with the key
   * @throws {StateDoesNotExist} When the key doesn't exist
   * @throws {StateInvalidCast} When casting fails in strict mode
   */
  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  /**
   * Retrieves a value from session storage with a fallback
   * @template T - The expected type of the value
   * @param key - The key to retrieve
   * @param options - Options with a fallback value
   * @returns The value associated with the key or the fallback
   */
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  /**
   * Retrieves a value from session storage
   * @template T - The expected type of the value
   * @param key - The key to retrieve
   * @param options - Optional configuration
   * @returns The value associated with the key or undefined
   */
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

  /**
   * Stores a value in session storage
   * @template T - The type of the value to store
   * @param key - The key to store the value under
   * @param value - The value to store (will be JSON stringified)
   * @emits Will emit an event with the key and new value
   */
  static set<T = unknown>(key: string, value: T): void {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
    SessionState.emit(key, value);
  }

  /**
   * Removes a value from session storage
   * @param key - The key to remove
   * @emits Will emit an event with the key and null value
   */
  static remove(key: string): void {
    sessionStorage.removeItem(key);
    SessionState.emit(key, null);
  }

  /**
   * Clears all values from session storage
   * @emits Will emit an event for each removed key with null value
   */
  static clear(): void {
    Object.keys(sessionStorage).forEach(key => {
      sessionStorage.removeItem(key);
      SessionState.emit(key, null);
    });
  }

  /**
   * Checks if a key exists in session storage
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  static has(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }
}