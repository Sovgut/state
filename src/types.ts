/**
 * Type representing the supported primitive data types.
 * This type is used to specify the expected data type
 * for casting values retrieved from the state.
 */
export type ISupportedPrimitive = "bigint" | "boolean" | "number" | "object" | "string";

export interface IStrategyOptions<Fallback = unknown> {
  fallback?: Fallback;
  cast?: ISupportedPrimitive;
}

export type IStrategy = "local" | "session" | "cookie" | "memory";

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
