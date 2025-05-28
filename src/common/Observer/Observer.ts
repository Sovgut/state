import { type IStorageEventData } from "~/types.ts";

export type Callback<T = unknown> = (event: IStorageEventData<T>) => void;

export class Observer {
  private static eventRegistry = new Map<Function, {
    events: Map<string | symbol, Set<Callback>>,
    onceEvents: Map<string | symbol, Set<Callback>>
  }>();

  private static getRegistry(target: Function) {
    if (!Observer.eventRegistry.has(target)) {
      Observer.eventRegistry.set(target, {
        events: new Map(),
        onceEvents: new Map()
      });
    }
    return Observer.eventRegistry.get(target)!;
  }

  public static on<T = unknown>(event: string, callback: Callback<T>): void {
    const registry = Observer.getRegistry(this);
    if (!registry.events.has(event)) {
      registry.events.set(event, new Set());
    }
    registry.events.get(event)!.add(callback as Callback);
  }

  public static once<T = unknown>(event: string, callback: Callback<T>): void {
    const registry = Observer.getRegistry(this);
    if (!registry.onceEvents.has(event)) {
      registry.onceEvents.set(event, new Set());
    }
    registry.onceEvents.get(event)!.add(callback as Callback);
  }

  public static off<T = unknown>(event: string, callback: Callback<T>): void {
    const registry = Observer.getRegistry(this);
    registry.events.get(event)?.delete(callback as Callback);
    registry.onceEvents.get(event)?.delete(callback as Callback);
  }

  public static emit<T = unknown>(event: string, data: IStorageEventData<T>): void {
    const registry = Observer.getRegistry(this);
    registry.events.get(event)?.forEach(listener => listener(data));
    
    const onceListeners = registry.onceEvents.get(event);
    if (onceListeners) {
      onceListeners.forEach(listener => listener(data));
      registry.onceEvents.delete(event);
    }
  }

  public static removeAllListeners(): void {
    const registry = Observer.getRegistry(this);
    registry.events.clear();
    registry.onceEvents.clear();
  }

  public static removeListener(event: string): void {
    const registry = Observer.getRegistry(this);
    registry.events.delete(event);
    registry.onceEvents.delete(event);
  }

  public static listenerCount(event: string): number {
    const registry = Observer.getRegistry(this);
    const regular = registry.events.get(event)?.size || 0;
    const once = registry.onceEvents.get(event)?.size || 0;
    return regular + once;
  }

  public static eventNames(): (string | symbol)[] {
    const registry = Observer.getRegistry(this);
    const names = new Set([...registry.events.keys(), ...registry.onceEvents.keys()]);
    return Array.from(names);
  }
}
