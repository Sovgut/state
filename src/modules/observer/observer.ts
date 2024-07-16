import EventEmitter from "eventemitter3";

export interface ICallbackEvent<Payload = any> {
  payload?: Payload;
  strategy: string;
}

export type EventCallback<Payload = any> = (data: ICallbackEvent<Payload>) => void;

export class Observer {
  protected static readonly observer = new EventEmitter();

  public static on<Payload = any>(event: string, callback: EventCallback<Payload>): void {
    this.observer.on(event, callback);
  }

  public static once<Payload = any>(event: string, callback: EventCallback<Payload>): void {
    this.observer.once(event, callback);
  }

  public static off(event: string, callback: EventCallback): void {
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
}
