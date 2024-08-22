import { IStrategyOptions } from "@/types";
import { Observer } from "../observer/observer";
import { serialize } from "@/utils/serialize";
import { stringify } from "@/utils/stringify";

export class MemoryState extends Observer {
  private static readonly instance = new Map();
  public static readonly strategy = "memory";

  /**
   * Retrieves the value associated with the specified key.
   *
   * @param key - The key of the item to retrieve.
   * @param [options] - The strategy options like `fallback` or `cast`.
   * @returns The value associated with the key, or null if not found.
   */
  public static getItem<Type = unknown>(key: string, options?: IStrategyOptions<Type>): Type {
    const value = this.instance.get(key);

    return serialize(value, options);
  }

  /**
   * Stores a value with the specified key.
   *
   * @param key - The key to associate with the value.
   * @param value - The value to store.
   */
  public static setItem(key: string, value: unknown): void {
    this.instance.set(key, stringify(value));
    this.observer.emit(key, { key, value, strategy: this.strategy });
  }

  /**
   * Removes the item associated with the specified key.
   *
   * @param key - The key of the item to remove.
   */
  public static removeItem(key: string): void {
    this.instance.delete(key);
    this.observer.emit(key, { key, strategy: this.strategy });
  }

  /**
   * Clears all items from the storage.
   */
  public static clear(): void {
    const keys = Array.from(this.instance.keys());

    this.instance.clear();

    for (let i = 0; i < keys.length; i++) {
      this.observer.emit(keys[i], { key: keys[i], strategy: this.strategy });
    }
  }

  /**
   * Checks if an item with the specified key exists in the storage.
   * This method is optional.
   *
   * @param key - The key of the item to check.
   * @returns True if the item exists, otherwise false.
   */
  public static has(key: string): boolean {
    return this.instance.has(key);
  }
}
