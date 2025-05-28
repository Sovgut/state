import { type IStorageEventData } from "~/types.ts";
import EventEmitter from "eventemitter3";

export type Callback<T = unknown> = (event: IStorageEventData<T>) => void;

export class Observer {
  protected static readonly observer = new EventEmitter();

  public static on<T = unknown>(event: string, callback: Callback<T>): void {
    this.observer.on(event, callback);
  }

  public static once<T = unknown>(event: string, callback: Callback<T>): void {
    this.observer.once(event, callback);
  }

  public static off<T = unknown>(event: string, callback: Callback<T>): void {
    this.observer.off(event, callback);
  }

  public static removeAllListeners(): void {
    this.observer.removeAllListeners();
  }

  public static listenerCount(event: string): number {
    return this.observer.listenerCount(event);
  }

  public static removeListener(event: string): void {
    this.observer.removeListener(event);
  }

  public static eventNames(): (string | symbol)[] {
    return this.observer.eventNames();
  }

  public static emit<T = unknown>(event: string, data: IStorageEventData<T>): void {
    this.observer.emit(event, data);
  }
}
