import { type IStorageEventData } from "~/types.ts";

/**
 * Callback function type for event listeners.
 * @template T - The type of data passed to the callback
 */
export type Callback<T = unknown> = (event: IStorageEventData<T>) => void;

type Registry = {
  events: Map<string, Set<Callback>>;
  onceEvents: Map<string, Set<Callback>>;
};

/**
 * Base observer class providing event-emitter functionality for state classes.
 * Each subclass gets its own isolated event registry, so LocalState listeners
 * don't fire on SessionState events and vice-versa.
 */
export class Observer {
  // WeakMap lets dynamically-created subclasses be garbage-collected
  // along with their listener registries.
  private static eventRegistry = new WeakMap<Function, Registry>();

  private static getRegistry(target: Function): Registry {
    let reg = Observer.eventRegistry.get(target);
    if (!reg) {
      reg = { events: new Map(), onceEvents: new Map() };
      Observer.eventRegistry.set(target, reg);
    }
    return reg;
  }

  /**
   * Adds an event listener for the specified event.
   */
  public static on<T = unknown>(event: string, callback: Callback<T>): void {
    const reg = Observer.getRegistry(this);
    let set = reg.events.get(event);
    if (!set) {
      set = new Set();
      reg.events.set(event, set);
    }
    set.add(callback as Callback);
  }

  /**
   * Adds a one-time event listener that fires at most once and is then removed.
   */
  public static once<T = unknown>(event: string, callback: Callback<T>): void {
    const reg = Observer.getRegistry(this);
    let set = reg.onceEvents.get(event);
    if (!set) {
      set = new Set();
      reg.onceEvents.set(event, set);
    }
    set.add(callback as Callback);
  }

  /**
   * Removes a specific listener (from both regular and once registries).
   */
  public static off<T = unknown>(event: string, callback: Callback<T>): void {
    const reg = Observer.getRegistry(this);
    reg.events.get(event)?.delete(callback as Callback);
    reg.onceEvents.get(event)?.delete(callback as Callback);
  }

  /**
   * Emits an event to all registered listeners.
   *
   * Guarantees:
   *  - A throwing listener never blocks other listeners.
   *  - A throwing listener never propagates the error into the caller of `set/remove/clear`.
   *  - Mutating listener sets during emission is safe (iteration uses a snapshot).
   *  - A recursive `emit` from inside a `once` callback will NOT re-fire the same once-listeners.
   */
  public static emit<T = unknown>(event: string, data: IStorageEventData<T>): void {
    const reg = Observer.getRegistry(this);

    const regular = reg.events.get(event);
    if (regular && regular.size > 0) {
      const snapshot = Array.from(regular);
      for (const listener of snapshot) {
        try {
          listener(data);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`[Observer] listener for "${event}" threw:`, err);
        }
      }
    }

    const once = reg.onceEvents.get(event);
    if (once && once.size > 0) {
      const snapshot = Array.from(once);
      // Delete BEFORE invoking. If a callback re-emits the same event,
      // these once-listeners must not fire again.
      reg.onceEvents.delete(event);
      for (const listener of snapshot) {
        try {
          listener(data);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`[Observer] once-listener for "${event}" threw:`, err);
        }
      }
    }
  }

  /**
   * Removes every listener for every event on this class.
   */
  public static removeAllListeners(): void {
    const reg = Observer.getRegistry(this);
    reg.events.clear();
    reg.onceEvents.clear();
  }

  /**
   * Removes every listener for a single event.
   */
  public static removeListener(event: string): void {
    const reg = Observer.getRegistry(this);
    reg.events.delete(event);
    reg.onceEvents.delete(event);
  }

  /**
   * Total number of listeners (regular + once) for an event.
   */
  public static listenerCount(event: string): number {
    const reg = Observer.getRegistry(this);
    return (reg.events.get(event)?.size ?? 0) + (reg.onceEvents.get(event)?.size ?? 0);
  }

  /**
   * All event names with at least one listener.
   */
  public static eventNames(): string[] {
    const reg = Observer.getRegistry(this);
    const names = new Set<string>([...reg.events.keys(), ...reg.onceEvents.keys()]);
    return Array.from(names);
  }
}