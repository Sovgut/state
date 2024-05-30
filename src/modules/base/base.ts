import { UnsupportedException } from "@/errors/unsupported/unsupported";
import { ISupportedPrimitive, IProvider } from "@/types";
import EventEmitter from "eventemitter3";

export class BaseState {
  protected static type = "BaseState";
  private static observer = new EventEmitter()
  public static provider: IProvider | undefined = undefined;

  public static on(event: `${string}:${'set' | 'unset'}`, callback: (...args: any[]) => void): void {
    this.observer.on(event, callback);
  }

  public static once(event: `${string}:${'set' | 'unset'}`, callback: (...args: any[]) => void): void {
    this.observer.on(event, callback);
  }

  public static off(event: `${string}:${'set' | 'unset'}`, callback: (...args: any[]) => void): void {
    this.observer.on(event, callback);
  }

  public static get<T = unknown>(
    key: string,
    options?: { fallback?: T; cast?: ISupportedPrimitive }
  ): T {
    if (typeof this.provider === "undefined") {
      throw new UnsupportedException("provider");
    }

    const raw: string | null | undefined = this.provider.getItem(key);
    if (raw === null || typeof raw === "undefined") {
      return options?.fallback as T;
    }

    const type = options?.cast ?? typeof options?.fallback;
    switch (type) {
      case "bigint": {
        return BigInt(raw) as T;
      }
      case "boolean": {
        return (raw.toLowerCase() === ("true" as unknown)) as T;
      }
      case "number": {
        return Number(raw) as T;
      }
      case "object": {
        return JSON.parse(raw) as T;
      }
      case "string": {
        return raw as T;
      }
      default: {
        return raw as T;
      }
    }
  }

  public static set(key: string, value: unknown): void {
    if (typeof this.provider === "undefined") {
      throw new UnsupportedException("provider");
    }

    switch (typeof value) {
      case "bigint": {
        this.provider.setItem(key, value.toString());
        this.observer.emit(`${key}:set`, {  key, value, type: this.type });
        break;
      }
      case "boolean": {
        this.provider.setItem(key, String(value));
        this.observer.emit(`${key}:set`, {  key, value, type: this.type });
        break; 
      }
      case "number": {
        this.provider.setItem(key, String(value));
        this.observer.emit(`${key}:set`, {  key, value, type: this.type });
        break; 
      }
      case "object": {
        this.provider.setItem(key, JSON.stringify(value));
        this.observer.emit(`${key}:set`, {  key, value, type: this.type });
        break; 
      }
      case "string": {
        this.provider.setItem(key, value);
        this.observer.emit(`${key}:set`, {  key, value, type: this.type });
        break; 
      }
    }
  }

  public static unset(key: string): void {
    if (typeof this.provider === "undefined") {
      throw new UnsupportedException("provider");
    }

    this.provider.removeItem(key);
    this.observer.emit(`${key}:unset`, {  key, type: this.type });
  }

  public static clear(): void {
    if (typeof this.provider === "undefined") {
      throw new UnsupportedException("provider");
    }

    this.provider.clear();
  }

  public static has(key: string): boolean {
    if (typeof this.provider === "undefined") {
      throw new UnsupportedException("provider");
    }

    if (typeof this.provider.has !== "undefined") {
      return this.provider.has(key);
    }

    return !!this.provider.getItem(key);
  }
}
