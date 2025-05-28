import { type IStorageEventData } from "~/types.ts";

/**
 * Callback function type for event listeners
 * @template T - The type of data passed to the callback
 */
export type Callback<T = unknown> = (event: IStorageEventData<T>) => void;

/**
 * Base observer class that provides event emitter functionality for state management classes.
 * Uses a registry pattern to maintain separate event systems for each inheriting class.
 */
export class Observer {
  private static eventRegistry = new Map<Function, {
    events: Map<string | symbol, Set<Callback>>,
    onceEvents: Map<string | symbol, Set<Callback>>
  }>();

  /**
   * Gets or creates the event registry for a specific class
   * @param target - The class constructor function
   * @returns The event registry for the target class
   */
  private static getRegistry(target: Function) {
    if (!Observer.eventRegistry.has(target)) {
      Observer.eventRegistry.set(target, {
        events: new Map(),
        onceEvents: new Map()
      });
    }
    return Observer.eventRegistry.get(target)!;
  }

  /**
   * Adds an event listener for the specified event
   * @template T - The type of data passed to the callback
   * @param event - The name of the event to listen for
   * @param callback - The callback function to execute when the event is emitted
   */
  public static on<T = unknown>(event: string, callback: Callback<T>): void {
    const registry = Observer.getRegistry(this);
    if (!registry.events.has(event)) {
      registry.events.set(event, new Set());
    }
    registry.events.get(event)!.add(callback as Callback);
  }

  /**
   * Adds a one-time event listener for the specified event
   * @template T - The type of data passed to the callback
   * @param event - The name of the event to listen for
   * @param callback - The callback function to execute once when the event is emitted
   */
  public static once<T = unknown>(event: string, callback: Callback<T>): void {
    const registry = Observer.getRegistry(this);
    if (!registry.onceEvents.has(event)) {
      registry.onceEvents.set(event, new Set());
    }
    registry.onceEvents.get(event)!.add(callback as Callback);
  }

  /**
   * Removes an event listener for the specified event
   * @template T - The type of data passed to the callback
   * @param event - The name of the event
   * @param callback - The callback function to remove
   */
  public static off<T = unknown>(event: string, callback: Callback<T>): void {
    const registry = Observer.getRegistry(this);
    registry.events.get(event)?.delete(callback as Callback);
    registry.onceEvents.get(event)?.delete(callback as Callback);
  }

  /**
   * Emits an event with the given data to all registered listeners
   * @template T - The type of data being emitted
   * @param event - The name of the event to emit
   * @param data - The data to pass to the event listeners
   */
  public static emit<T = unknown>(event: string, data: IStorageEventData<T>): void {
    const registry = Observer.getRegistry(this);
    registry.events.get(event)?.forEach(listener => listener(data));
    
    const onceListeners = registry.onceEvents.get(event);
    if (onceListeners) {
      onceListeners.forEach(listener => listener(data));
      registry.onceEvents.delete(event);
    }
  }

  /**
   * Removes all event listeners for all events
   */
  public static removeAllListeners(): void {
    const registry = Observer.getRegistry(this);
    registry.events.clear();
    registry.onceEvents.clear();
  }

  /**
   * Removes all listeners for a specific event
   * @param event - The name of the event
   */
  public static removeListener(event: string): void {
    const registry = Observer.getRegistry(this);
    registry.events.delete(event);
    registry.onceEvents.delete(event);
  }

  /**
   * Gets the number of listeners for a specific event
   * @param event - The name of the event
   * @returns The total number of listeners (regular + once)
   */
  public static listenerCount(event: string): number {
    const registry = Observer.getRegistry(this);
    const regular = registry.events.get(event)?.size || 0;
    const once = registry.onceEvents.get(event)?.size || 0;
    return regular + once;
  }

  /**
   * Gets an array of all event names that have listeners
   * @returns Array of event names
   */
  public static eventNames(): (string | symbol)[] {
    const registry = Observer.getRegistry(this);
    const names = new Set([...registry.events.keys(), ...registry.onceEvents.keys()]);
    return Array.from(names);
  }
}
