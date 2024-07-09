import { ISupportedPrimitive } from "@/types";
import { Is } from "@/utils/is";

export interface ITransformOptions {
    fallback?: any;
    cast?: ISupportedPrimitive;
}

export class Serializer {
    private $value: any;

    public of(value: any): Serializer {
        this.$value = value;

        return this;
    }

    public transform(options?: ITransformOptions): unknown {
        if (Is.empty(this.$value)) {
            if (!Is.undefined(options?.fallback)) {
                return options.fallback;
            }

            return undefined;
        }

        if (options.cast) {

        }

        return this.$value;
    }
}