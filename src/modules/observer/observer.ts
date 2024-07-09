import EventEmitter from "eventemitter3";

export interface ICallbackEvent<Payload = any> {
  payload?: Payload;
  strategy: string;
}

export type EventCallback<Payload = any> = (data: ICallbackEvent<Payload>) => void;

export class Observer {
  protected static readonly instance = new EventEmitter();

  public static on<Payload = any>(event: string, callback: EventCallback<Payload>): void {
    this.instance.on(event, callback);
  }

  public static once<Payload = any>(event: string, callback: EventCallback<Payload>): void {
    this.instance.once(event, callback);
  }

  public static off(event: string, callback: EventCallback): void {
    this.instance.off(event, callback);
  }

  public static removeAllListeners(): void {
    this.instance.removeAllListeners();
  }

  public static listenerCount(event: string): number {
    return this.instance.listenerCount(event);
  }

  public static removeListener(event: string): void {
    this.instance.removeListener(event);
  }

  public static eventNames(): (string | symbol)[] {
    return this.instance.eventNames();
  }
}
