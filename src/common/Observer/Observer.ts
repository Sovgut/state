import { type IStorageEventData } from "~/types.ts";

export type Callback<T = unknown> = (event: IStorageEventData<T>) => void;

export class Observer {
  private static events: Map<string | symbol, Set<Callback>> = new Map();
  private static onceEvents: Map<string | symbol, Set<Callback>> = new Map();

  public static on<T = unknown>(event: string, callback: Callback<T>): void {
    if (!Observer.events.has(event)) {
      Observer.events.set(event, new Set());
    }
    Observer.events.get(event)!.add(callback as Callback);
  }

  public static once<T = unknown>(event: string, callback: Callback<T>): void {
    if (!Observer.onceEvents.has(event)) {
      Observer.onceEvents.set(event, new Set());
    }
    Observer.onceEvents.get(event)!.add(callback as Callback);
  }

  public static off<T = unknown>(event: string, callback: Callback<T>): void {
    Observer.events.get(event)?.delete(callback as Callback);
    Observer.onceEvents.get(event)?.delete(callback as Callback);
  }

  public static emit<T = unknown>(event: string, data: IStorageEventData<T>): void {
    Observer.events.get(event)?.forEach(listener => listener(data));
    
    const onceListeners = Observer.onceEvents.get(event);
    if (onceListeners) {
      onceListeners.forEach(listener => listener(data));
      Observer.onceEvents.delete(event);
    }
  }

  public static removeAllListeners(): void {
    Observer.events.clear();
    Observer.onceEvents.clear();
  }

  public static removeListener(event: string): void {
    Observer.events.delete(event);
    Observer.onceEvents.delete(event);
  }

  public static listenerCount(event: string): number {
    const regular = Observer.events.get(event)?.size || 0;
    const once = Observer.onceEvents.get(event)?.size || 0;
    return regular + once;
  }

  public static eventNames(): (string | symbol)[] {
    const names = new Set([...Observer.events.keys(), ...Observer.onceEvents.keys()]);
    return Array.from(names);
  }
}
