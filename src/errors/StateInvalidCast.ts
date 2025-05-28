/**
 * Error thrown when a value cannot be cast to the requested type in strict mode
 */
export class StateInvalidCast extends Error {
    /**
     * Creates a new StateInvalidCast error
     * @param key - The key of the value that failed to cast
     * @param storage - The storage type where the value is stored
     * @param value - The actual value that failed to cast
     * @param type - The target type that the cast failed to
     */
    constructor(public key: string, public storage = 'storage', public value: unknown, public type: string) {
        super(`Cannot cast value for key "${key}" in ${storage} to type "${type}". Value: ${value}`);
        this.name = 'CannotCastValue';
    }
}