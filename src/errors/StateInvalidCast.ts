export class StateInvalidCast extends Error {
    constructor(public key: string, public storage = 'storage', public value: unknown, public type: string) {
        super(`Cannot cast value for key "${key}" in ${storage} to type "${type}". Value: ${value}`);
        this.name = 'CannotCastValue';
    }
}