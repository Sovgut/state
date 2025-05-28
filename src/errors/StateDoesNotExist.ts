/**
 * Error thrown when attempting to access a state key that doesn't exist in strict mode
 */
export class StateDoesNotExist extends Error {
    /**
     * Creates a new StateDoesNotExist error
     * @param key - The key that was not found
     * @param storage - The storage type where the key was not found
     */
    constructor(public key: string, public storage: string = 'storage') {
        super(`Key "${key}" does not exist in the ${storage}.`);
        this.name = 'KeyDoesNotExist';
    }
}