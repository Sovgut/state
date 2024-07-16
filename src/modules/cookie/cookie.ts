import { stringify } from "@/utils/stringify";
import { Observer } from "../observer/observer";
import { IStrategyOptions } from "@/types";
import { serialize } from "@/utils/serialize";

interface ICookieStateOptions {
  expiresMs?: number;
  transform?: (cookie: string) => string;
}

export class CookieState extends Observer {
  public static readonly strategy = "cookie";

  /**
   * Retrieves the value associated with the specified key.
   *
   * @param key - The key of the item to retrieve.
   * @returns The value associated with the key, or null if not found.
   */
  public static getItem<Type = unknown>(key: string, options?: IStrategyOptions<Type>): Type {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];

      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }

      if (c.indexOf(name) === 0) {
        return serialize(c.substring(name.length, c.length), options);
      }
    }

    return serialize(null, options);
  }

  /**
   * Stores a value with the specified key.
   *
   * @param key - The key to associate with the value.
   * @param value - The value to store.
   */
  public static setItem(key: string, value: unknown, options?: ICookieStateOptions): void {
    const d = new Date();
    let cookie = String();

    if (options?.expiresMs) {
      d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000 + options.expiresMs);
    } else {
      d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    }

    const expires = "expires=" + d.toUTCString();
    const stringified = stringify(value);
    cookie = key + "=" + stringified + ";" + expires + ";path=/";

    if (options?.transform) {
      cookie = options.transform(cookie);
    }

    document.cookie = cookie;
    this.observer.emit(key, {
      key,
      value: stringified,
      strategy: this.strategy,
    });
  }

  /**
   * Removes the item associated with the specified key.
   *
   * @param key - The key of the item to remove.
   */
  public static removeItem(key: string): void {
    document.cookie = key + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    this.observer.emit(key, { key, strategy: this.strategy });
  }

  /**
   * Clears all items from the storage.
   */
  public static clear(): void {
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substring(0, eqPos) : c;

      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
      this.observer.emit(name, { key: name, strategy: this.strategy });
    }
  }

  /**
   * Checks if an item with the specified key exists in the storage.
   *
   * @param key - The key of the item to check.
   * @returns True if the item exists, otherwise false.
   */
  public static has(key: string): boolean {
    return this.getItem(key) !== null;
  }
}
