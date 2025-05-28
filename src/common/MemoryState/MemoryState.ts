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
 * In-memory state management class that stores data in a Map.
 * Data persists only during the current session and is lost on page reload.
 * Extends Observer to provide event emission capabilities.
 */
export class MemoryState extends Observer {
  private static storage = new Map<string, unknown>();

  /**
   * Retrieves a value from memory state with strict type checking
   * @template T - The expected type of the value
   * @param key - The key to retrieve
   * @param options - Options with strict mode enabled
   * @returns The value associated with the key
   * @throws {StateDoesNotExist} When the key doesn't exist
   * @throws {StateInvalidCast} When casting fails in strict mode
   */
  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  /**
   * Retrieves a value from memory state with a fallback
   * @template T - The expected type of the value
   * @param key - The key to retrieve
   * @param options - Options with a fallback value
   * @returns The value associated with the key or the fallback
   */
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  /**
   * Retrieves a value from memory state
   * @template T - The expected type of the value
   * @param key - The key to retrieve
   * @param options - Optional configuration
   * @returns The value associated with the key or undefined
   */
  static get<T = unknown>(key: string, options?: Options<T>): T | undefined;
  static get<T = unknown>(key: string, options: Options<T> = {}): T | undefined {
    const value = MemoryState.storage.get(key);

    if (value === undefined) {
      if (options.strict) {
        throw new StateDoesNotExist(key, 'memory');
      }
      return options.fallback !== undefined ? options.fallback : undefined;
    }

    if (options.fallback !== undefined &&
      (value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && value !== null && Object.keys(value).length === 0))) {
      return options.fallback;
    }

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
          throw new StateInvalidCast(key, 'memory', value, options.cast);
        }
        return options.fallback !== undefined ? options.fallback : undefined;
      }
    }

    return value as T;
  }

  /**
   * Stores a value in memory state
   * @template T - The type of the value to store
   * @param key - The key to store the value under
   * @param value - The value to store
   * @emits Will emit an event with the key and new value
   */
  static set<T = unknown>(key: string, value: T): void {
    MemoryState.storage.set(key, value);
    MemoryState.emit(key, value);
  }

  /**
   * Removes a value from memory state
   * @param key - The key to remove
   * @emits Will emit an event with the key and null value
   */
  static remove(key: string): void {
    MemoryState.storage.delete(key);
    MemoryState.emit(key, null);
  }

  /**
   * Clears all values from memory state
   * @emits Will emit an event for each removed key with null value
   */
  static clear(): void {
    const keys = Array.from(MemoryState.storage.keys());
    MemoryState.storage.clear();

    keys.forEach((key) => MemoryState.emit(key, null));
  }

  /**
   * Checks if a key exists in memory state
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  static has(key: string): boolean {
    return MemoryState.storage.has(key);
  }
}