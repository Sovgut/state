export class StateDoesNotExist extends Error {
    constructor(public key: string, public storage: string = 'storage') {
        super(`Key "${key}" does not exist in the ${storage}.`);
        this.name = 'KeyDoesNotExist';
    }
}