import { BaseState } from "../base/base";

export class MemoryState extends BaseState {
  static {
    const instance = new Map();

    MemoryState.type = "MemoryState"
    MemoryState.provider = {
      getItem(key: string) {
        return instance.get(key);
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
