# @sovgut/state

A lightweight and flexible state management library for TypeScript/JavaScript applications. This package provides an easy way to manage state using different storage mechanisms such as `localStorage`, `sessionStorage`, cookies, and an in-memory storage solution. Additionally, it supports an observer mode to listen for changes in the state.

## Installation

You can install the package using npm:

```bash
npm install @sovgut/state
```

Or using yarn:

```bash
yarn add @sovgut/state
```

## Features

- Simple and intuitive API
- Supports multiple storage mechanisms:
  - `localStorage`
  - `sessionStorage`
  - Cookies
  - In-memory storage
- TypeScript support
- Custom fallback values
- Type casting support for stored values
- Observer mode to listen for changes

## Usage

### Importing the State Classes

```typescript
import { LocalState, SessionState, MemoryState, CookieState } from "@sovgut/state";
```

### Setting Values

You can store different types of values in the state:

```typescript
LocalState.set("key-1", 1n);         // BigInt
LocalState.set("key-2", 1);          // Number
LocalState.set("key-3", "foo");      // String
LocalState.set("key-4", true);       // Boolean
LocalState.set("key-5", {});         // Object
LocalState.set("key-6", []);         // Array
```

### Getting Values

You can retrieve values from the state with optional type casting:

```typescript
const value1 = LocalState.get("key-1", { cast: "bigint" });    // 1n
const value2 = LocalState.get("key-2", { cast: "number" });    // 1
const value3 = LocalState.get("key-3", { cast: "string" });    // "foo"
const value4 = LocalState.get("key-4", { cast: "boolean" });   // true
const value5 = LocalState.get("key-5", { cast: "object" });    // {}
const value6 = LocalState.get("key-6", { cast: "object" });    // []
```

You can also provide fallback values:

```typescript
const value7 = LocalState.get("nonexistent-key", { fallback: 1n });    // 1n
const value8 = LocalState.get("nonexistent-key", { fallback: 1 });     // 1
const value9 = LocalState.get("nonexistent-key", { fallback: "foo" }); // "foo"
const value10 = LocalState.get("nonexistent-key", { fallback: true }); // true
const value11 = LocalState.get("nonexistent-key", { fallback: {} });   // {}
const value12 = LocalState.get("nonexistent-key", { fallback: [] });   // []
```

### Removing Values

You can remove a specific key from the state:

```typescript
LocalState.unset("key-1");
```

### Clearing All Values

You can clear all values from the state:

```typescript
LocalState.clear();
```

### Checking for Existence

You can check if a key exists in the state:

```typescript
const exists = LocalState.has("key-1"); // true or false
```

## Using Other Storage Mechanisms

The same API applies to `SessionState`, `MemoryState`, and `CookieState`:

```typescript
SessionState.set("key", "value");
const sessionValue = SessionState.get("key");

MemoryState.set("key", "value");
const memoryValue = MemoryState.get("key");

CookieState.set("key", "value");
const cookieValue = CookieState.get("key");
```

## Observer Mode

You can listen for changes to the state using the observer mode:

### Adding Event Listeners

```typescript
function onLocalStateChange(event: IProviderEvent) {
  console.log(`${event.key} changed in ${event.provider}`, event.value);
}

LocalState.on("key-1", onLocalStateChange);
LocalState.once("key-2", onLocalStateChange);
```

### Removing Event Listeners

```typescript
LocalState.off("key-1", onLocalStateChange);
```

### Removing All Listeners

You can remove all event listeners:

```typescript
LocalState.removeAllListeners();
```

### Event Data

The event object contains the key, value, and provider of change:

```typescript
{
  key: string;
  value?: unknown;
  provider: string;
}
```

## Extending to Custom Providers

You can extend the `BaseState` class to support custom storage providers by implementing the `IProvider` interface:

```typescript
import { BaseState, IProvider } from "@sovgut/state";

class CustomProvider implements IProvider {
  private storage = new Map<string, string>();

  getItem(key: string) {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string) {
    this.storage.set(key, value);
  }

  removeItem(key: string) {
    this.storage.delete(key);
  }

  clear() {
    this.storage.clear();
  }

  has(key: string) {
    return this.storage.has(key);
  }
}

class CustomState extends BaseState {
  static {
    CustomState.type = "CustomState"
    CustomState.provider = new CustomProvider();
  }
}

CustomState.set("key", "value");
const customValue = CustomState.get("key");
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This README provides a comprehensive overview of the `@sovgut/state` package, including installation, usage examples, and information on contributing.
