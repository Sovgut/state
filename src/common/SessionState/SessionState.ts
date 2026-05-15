import { Observer } from "~/common/Observer/Observer.ts";
import { resolveValue, type Options } from "~/common/internal/resolveValue.ts";
import { hasSessionStorage } from "~/common/internal/env.ts";

const STORAGE_NAME = "sessionStorage";

/**
 * Session-storage-backed state management.
 * Data persists only for the duration of the page session (until the tab is closed).
 */
export class SessionState extends Observer {
  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  static get<T = unknown>(key: string, options?: Options<T>): T | undefined;
  static get<T = unknown>(key: string, options: Options<T> = {}): T | undefined {
    if (!hasSessionStorage()) {
      return resolveValue<T>({ found: false }, options, STORAGE_NAME, key);
    }

    let raw: string | null;
    try {
      raw = sessionStorage.getItem(key);
    } catch {
      return resolveValue<T>({ found: false }, options, STORAGE_NAME, key);
    }

    if (raw === null) {
      return resolveValue<T>({ found: false }, options, STORAGE_NAME, key);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }

    return resolveValue<T>({ found: true, value: parsed }, options, STORAGE_NAME, key);
  }

  /**
   * Stores a value in session storage.
   * Always JSON-serialises (see LocalState.set for the rationale).
   */
  static set<T = unknown>(key: string, value: T): void {
    if (!hasSessionStorage()) {
      throw new Error("sessionStorage is not available in this environment.");
    }

    let serialized: string | undefined;
    try {
      serialized = JSON.stringify(value);
    } catch (err) {
      throw new Error(
        `Cannot serialize value for key "${key}" in ${STORAGE_NAME}: ${(err as Error).message}`,
      );
    }

    if (serialized === undefined) {
      throw new Error(
        `Cannot store value for key "${key}" in ${STORAGE_NAME}: value is not serializable (undefined, function, or symbol).`,
      );
    }

    try {
      sessionStorage.setItem(key, serialized);
    } catch (err) {
      throw err;
    }

    SessionState.emit(key, value);
  }

  static remove(key: string): void {
    if (!hasSessionStorage()) return;
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    SessionState.emit(key, null);
  }

  static clear(): void {
    if (!hasSessionStorage()) return;

    let keys: string[];
    try {
      keys = Object.keys(sessionStorage);
    } catch {
      return;
    }

    try {
      sessionStorage.clear();
    } catch {
      for (const k of keys) {
        try {
          sessionStorage.removeItem(k);
        } catch {
          // ignore
        }
      }
    }

    for (const k of keys) {
      SessionState.emit(k, null);
    }
  }

  static has(key: string): boolean {
    if (!hasSessionStorage()) return false;
    try {
      return sessionStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }
}