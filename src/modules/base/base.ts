import { UnsupportedException } from "@/errors/unsupported/unsupported";
import type {
  IStrategyStorage,
  IStrategyEvent,
  IStrategyOptions,
} from "@/types";
import EventEmitter from "eventemitter3";

export class BaseState {
  protected static strategy = "base";
  private static observer = new EventEmitter();
  public static storage: IStrategyStorage | undefined;

  public static on<Value>(
    event: string,
    callback: (data: IStrategyEvent<Value>) => void
  ): void {
    this.observer.on(event, callback);
  }

  public static once<Value>(
    event: string,
    callback: (data: IStrategyEvent<Value>) => void
  ): void {
    this.observer.once(event, callback);
  }

  public static off<Value>(
    event: string,
    callback: (data: IStrategyEvent<Value>) => void
  ): void {
    this.observer.off(event, callback);
  }

  public static removeAllListeners(): void {
    this.observer.removeAllListeners();
  }

  public static get<Fallback = unknown>(
    key: string,
    options?: IStrategyOptions<Fallback>
  ): Fallback {
    if (typeof this.storage === "undefined") {
      throw new UnsupportedException("storage");
    }

    const raw: string | null | undefined = this.storage.getItem(key);
    if (raw === null) {
      return options?.fallback as Fallback;
    }

    const type = options?.cast ?? typeof options?.fallback;
    switch (type) {
      case "bigint": {
        return BigInt(raw) as Fallback;
      }
      case "boolean": {
        return (raw.toLowerCase() === ("true" as unknown)) as Fallback;
      }
      case "number": {
        return Number(raw) as Fallback;
      }
      case "object": {
        return JSON.parse(raw) as Fallback;
      }
      case "string": {
        return raw as Fallback;
      }
      default: {
        return raw as Fallback;
      }
    }
  }

  public static set(key: string, value: unknown): void {
    if (typeof this.storage === "undefined") {
      throw new UnsupportedException("storage");
    }

    switch (typeof value) {
      case "bigint": {
        this.storage.setItem(key, value.toString());
        this.observer.emit(key, { key, value, strategy: this.strategy });
        break;
      }
      case "boolean": {
        this.storage.setItem(key, String(value));
        this.observer.emit(key, { key, value, strategy: this.strategy });
        break;
      }
      case "number": {
        this.storage.setItem(key, String(value));
        this.observer.emit(key, { key, value, strategy: this.strategy });
        break;
      }
      case "object": {
        this.storage.setItem(key, JSON.stringify(value));
        this.observer.emit(key, { key, value, strategy: this.strategy });
        break;
      }
      case "string": {
        this.storage.setItem(key, value);
        this.observer.emit(key, { key, value, strategy: this.strategy });
        break;
      }
    }
  }

  public static unset(key: string): void {
    if (typeof this.storage === "undefined") {
      throw new UnsupportedException("storage");
    }

    this.storage.removeItem(key);
    this.observer.emit(key, { key, strategy: this.strategy });
  }

  public static clear(): void {
    if (typeof this.storage === "undefined") {
      throw new UnsupportedException("storage");
    }

    this.storage.clear();
  }

  public static has(key: string): boolean {
    if (typeof this.storage === "undefined") {
      throw new UnsupportedException("storage");
    }

    if (typeof this.storage.has !== "undefined") {
      return this.storage.has(key);
    }

    return !!this.storage.getItem(key);
  }
}
