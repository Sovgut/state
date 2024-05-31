import { BaseState } from "../base/base";

export class MemoryState extends BaseState {
  static {
    const instance = new Map();

    MemoryState.strategy = "memory"
    MemoryState.storage = {
      getItem(key: string) {
        const value = instance.get(key);

        if (typeof value === 'undefined') {
          return null;
        }

        return value
      },
      setItem(key: string, value: string) {
        instance.set(key, value);
      },
      removeItem(key: string) {
        instance.delete(key);
      },
      clear() {
        instance.clear();
      },
      has(key: string) {
        return instance.has(key);
      },
    };
  }
}
