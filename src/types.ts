/**
 * Type representing the supported primitive data types.
 * This type is used to specify the expected data type
 * for casting values retrieved from the state.
 */
export type ISupportedPrimitive =
  | "bigint"
  | "boolean"
  | "number"
  | "object"
  | "string";

export interface IStrategyOptions<Fallback = unknown> {
  fallback?: Fallback; 
  cast?: ISupportedPrimitive
}

export interface IStrategyStorage {
  /**
   * Retrieves the value associated with the specified key.
   *
   * @param key - The key of the item to retrieve.
   * @returns The value associated with the key, or null if not found.
   */
  getItem(key: string): string | null;

  /**
   * Stores a value with the specified key.
   *
   * @param key - The key to associate with the value.
   * @param value - The value to store.
   */
  setItem(key: string, value: unknown): void;

  /**
   * Removes the item associated with the specified key.
   *
   * @param key - The key of the item to remove.
   */
  removeItem(key: string): void;

  /**
   * Clears all items from the storage.
   */
  clear(): void;

  /**
   * Checks if an item with the specified key exists in the storage.
   * This method is optional.
   *
   * @param key - The key of the item to check.
   * @returns True if the item exists, otherwise false.
   */
  has?(key: string): boolean;
}

export type IStrategy =
  | "local"
  | "session"
  | "cookie"
  | "memory"
  | (string & NonNullable<unknown>);

export interface IStrategyEvent<Value = unknown> {
  /**
   * The key of the item in the state that triggered the event.
   */
  key: string;

  /**
   * The value associated with the key in the state.
   * This is optional and can be of any type.
   */
  value?: Value;

  /**
   * The strategy type indicating the source of the state change.
   * This will typically be one of the predefined types (local, session, cookie, memory),
   * or a custom strategy type as a string.
   */
  strategy: IStrategy;
}
