export class Is {
    public static empty(value: unknown): boolean {
        if (this.undefined(value)) return true;
        if (this.null(value)) return true;
        if (this.emptyObject(value)) return true;
        if (this.emptyString(value)) return true;

        return false;
    }

    public static undefined(value: unknown): value is undefined {
        return typeof value === 'undefined';
    }

    public static null(value: unknown): value is null {
        return value === null;
    }

    public static emptyObject(value: unknown): boolean {
        return !this.null(value) && typeof value === 'object' && Object.keys(value!).length === 0
    }

    public static emptyString(value: unknown): boolean {
        return typeof value === 'string' && value.length === 0;
    }
}