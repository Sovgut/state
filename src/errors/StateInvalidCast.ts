export class StateInvalidCast extends Error {
    constructor(public value: unknown, public type: string) {
        super(`Cannot cast value "${value}" to type "${type}".`);
        this.name = 'CannotCastValue';
    }
}