import { Observer } from "~/common/Observer/Observer.ts";
import { resolveValue, type Options } from "~/common/internal/resolveValue.ts";
import { hasLocalStorage } from "~/common/internal/env.ts";

const STORAGE_NAME = "localStorage";

/**
 * Local-storage-backed state management.
 * Data persists across browser sessions until explicitly cleared.
 */
export class LocalState extends Observer {
  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  static get<T = unknown>(key: string, options?: Options<T>): T | undefined;
  static get<T = unknown>(key: string, options: Options<T> = {}): T | undefined {
    if (!hasLocalStorage()) {
      return resolveValue<T>({ found: false }, options, STORAGE_NAME, key);
    }

    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      // SecurityError (private mode, disabled storage, sandboxed iframe)
      return resolveValue<T>({ found: false }, options, STORAGE_NAME, key);
    }

    if (raw === null) {
      return resolveValue<T>({ found: false }, options, STORAGE_NAME, key);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Value was written by something other than this library (legacy/foreign).
      // Surface it as the raw string rather than crashing.
      parsed = raw;
    }

    return resolveValue<T>({ found: true, value: parsed }, options, STORAGE_NAME, key);
  }

  /**
   * Stores a value in local storage.
   *
   * Always JSON-serialises. This is a deliberate change from the previous
   * implementation, which stored strings raw — that caused values like
   * `"42"` or `"true"` to come back as `42` and `true` after a roundtrip.
   *
   * @throws when the value cannot be serialised (circular refs, functions,
   *         symbols, undefined) or when localStorage refuses the write
   *         (QuotaExceededError, SecurityError).
   */
  static set<T = unknown>(key: string, value: T): void {
    if (!hasLocalStorage()) {
      throw new Error("localStorage is not available in this environment.");
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
      localStorage.setItem(key, serialized);
    } catch (err) {
      // QuotaExceededError, SecurityError — preserve original error for diagnostics
      throw err;
    }

    LocalState.emit(key, value);
  }

  /**
   * Removes a value from local storage.
   */
  static remove(key: string): void {
    if (!hasLocalStorage()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore — best-effort
    }
    LocalState.emit(key, null);
  }

  /**
   * Clears every value in local storage and emits a `null` event for each removed key.
   */
  static clear(): void {
    if (!hasLocalStorage()) return;

    let keys: string[];
    try {
      keys = Object.keys(localStorage);
    } catch {
      return;
    }

    try {
      localStorage.clear();
    } catch {
      // Fallback: remove keys one by one if `clear()` is blocked
      for (const k of keys) {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      }
    }

    for (const k of keys) {
      LocalState.emit(k, null);
    }
  }

  static has(key: string): boolean {
    if (!hasLocalStorage()) return false;
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }
}