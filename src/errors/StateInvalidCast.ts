/**
 * Safely converts any value (including symbols and bigints) to a printable string.
 */
function stringifyValueForMessage(value: unknown): string {
  try {
    if (typeof value === "symbol") return value.toString();
    if (typeof value === "bigint") return `${value.toString()}n`;
    if (typeof value === "object" && value !== null) {
      try {
        return JSON.stringify(value);
      } catch {
        return Object.prototype.toString.call(value);
      }
    }
    return String(value);
  } catch {
    return "<unprintable value>";
  }
}

/**
 * Error thrown when a value cannot be cast to the requested type in strict mode.
 */
export class StateInvalidCast extends Error {
  /**
   * Creates a new StateInvalidCast error.
   * @param key - The key of the value that failed to cast
   * @param storage - The storage type where the value is stored
   * @param value - The actual value that failed to cast
   * @param type - The target type that the cast failed to
   */
  constructor(
    public readonly key: string,
    public readonly storage: string = "storage",
    public readonly value: unknown,
    public readonly type: string
  ) {
    super(
      `Cannot cast value for key "${key}" in ${storage} to type "${type}". Value: ${stringifyValueForMessage(value)}`
    );
    this.name = "StateInvalidCast";
    Object.setPrototypeOf(this, StateInvalidCast.prototype);
  }
}
