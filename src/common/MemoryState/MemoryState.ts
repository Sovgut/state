import { type Options, resolveValue } from "~/common/internal/resolveValue.ts";
import { Observer } from "~/common/Observer/Observer.ts";

const STORAGE_NAME = "memory";

/**
 * In-memory state management. Data lives only for the current page lifecycle.
 *
 * Unlike LocalState/SessionState, values are stored by reference — there is no
 * JSON roundtrip. This means Date/Map/Set/class-instances survive a get/set
 * cycle intact (which is usually what you want), but it also means stored
 * objects are NOT defensively copied.
 */
export class MemoryState extends Observer {
  private static storage = new Map<string, unknown>();

  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  static get<T = unknown>(key: string, options?: Options<T>): T | undefined;
  static get<T = unknown>(key: string, options: Options<T> = {}): T | undefined {
    // Use .has() rather than value === undefined to distinguish
    // a missing key from an explicit `undefined` value.
    if (!MemoryState.storage.has(key)) {
      return resolveValue<T>({ found: false }, options, STORAGE_NAME, key);
    }
    const value = MemoryState.storage.get(key);
    return resolveValue<T>({ found: true, value }, options, STORAGE_NAME, key);
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
    for (const k of keys) {
      MemoryState.emit(k, null);
    }
  }

  static has(key: string): boolean {
    return MemoryState.storage.has(key);
  }
}
