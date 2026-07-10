/**
 * Data passed to storage event listeners.
 * `null` is emitted on remove/clear; otherwise the new value.
 *
 * Note: storing an explicit `null` value via `set()` will also emit `null`,
 * so listeners cannot distinguish "set to null" from "removed" by payload alone.
 */
export type IStorageEventData<T = unknown> = T | null;
