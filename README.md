# @sovgut/state

A lightweight and flexible state management library for any frontend application. This package provides an easy way to manage state using different storage mechanisms such as `localStorage`, `sessionStorage`, cookies, and an in-memory storage solution. Additionally, it supports an observer mode to listen for changes in the state.

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

### Using in React Component

Create a React component that uses the state and listens for changes using the observer mode.

```tsx
import { type IStrategyEvent, LocalState } from "@sovgut/state";
import { memo, useCallback, useEffect, useState } from "react";

export const App: React.FC = memo(() => {
  const [value, setValue] = useState<number>(
    LocalState.getItem("random-number-key", { fallback: Math.random() })
  );

  const handleUpdateEvent = useCallback((event: IStrategyEvent<number>) => {
    if (event.value) {
        setValue(event.value)
    }
  }, []);

  const handleOnClick = useCallback(() => {
    LocalState.setItem("random-number-key", Math.random())
  }, []);

  useEffect(() => {
    LocalState.on("random-number-key", handleUpdateEvent)

    return function cleanup() {
        LocalState.off("random-number-key", handleUpdateEvent)
    }
  }, [handleUpdateEvent]);

  return <button onClick={handleOnClick}>Current Value: {value}</button>
});
```

### Setting Values

You can store different types of values in the state:

```typescript
LocalState.setItem("key-1", 1n); // BigInt
LocalState.setItem("key-2", 1); // Number
LocalState.setItem("key-3", "foo"); // String
LocalState.setItem("key-4", true); // Boolean
LocalState.setItem("key-5", {}); // Object
LocalState.setItem("key-6", []); // Array
```

### Getting Values

You can retrieve values from the state with optional type casting:

```typescript
LocalState.getItem("key-1", { cast: "bigint" }); // 1n
LocalState.getItem("key-2", { cast: "number" }); // 1
LocalState.getItem("key-3", { cast: "string" }); // "foo"
LocalState.getItem("key-4", { cast: "boolean" }); // true
LocalState.getItem("key-5", { cast: "object" }); // {}
LocalState.getItem("key-6", { cast: "object" }); // []
```

You can also provide fallback values, which not only supply a default value if the key does not exist, but also define the type to cast the retrieved value:

```typescript
LocalState.getItem("nonexistent-key", { fallback: 1n }); // 1n
LocalState.getItem("nonexistent-key", { fallback: 1 }); // 1
LocalState.getItem("nonexistent-key", { fallback: "foo" }); // "foo"
LocalState.getItem("nonexistent-key", { fallback: true }); // true
LocalState.getItem("nonexistent-key", { fallback: {} }); // {}
LocalState.getItem("nonexistent-key", { fallback: [] }); // []

LocalState.setItem("key-1", 1n);
LocalState.setItem("key-2", 1);
LocalState.setItem("key-3", "foo");
LocalState.setItem("key-4", true);
LocalState.setItem("key-5", {});
LocalState.setItem("key-6", []);

LocalState.getItem("key-1", { fallback: 2n }); // 1n
LocalState.getItem("key-2", { fallback: 2 }); // 1
LocalState.getItem("key-3", { fallback: "bar" }); // "foo"
LocalState.getItem("key-4", { fallback: false }); // true
LocalState.getItem("key-5", { fallback: { foo: "bar" } }); // {}
LocalState.getItem("key-6", { fallback: [{ foo: "bar" }, { foo: "bar" }] }); // []
```

### Removing Values

You can remove a specific key from the state:

```typescript
LocalState.removeItem("key-1");
```

### Clearing All Values

You can clear all values from the state:

```typescript
LocalState.clear();
```

### Checking for Existence

You can check if a key exists in the state:

```typescript
LocalState.has("key-1"); // true or false
```

## Using Other Storage Mechanisms

The same API applies to `SessionState`, `MemoryState`, and `CookieState`:

```typescript
SessionState.setItem("key", "value");
const sessionValue = SessionState.get("key");

MemoryState.setItem("key", "value");
const memoryValue = MemoryState.get("key");

CookieState.setItem("key", "value");
const cookieValue = CookieState.get("key");
```

## Observer Mode

You can listen for changes to the state using the observer mode:

### Adding Event Listeners

```typescript
function onLocalStateChange(event: IStrategyEvent) {
  console.log(`${event.key} changed in ${event.strategy} strategy`, event.value);
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

The event object contains the key, value, and strategy of change:

```typescript
export type IStrategy =
  | "local"
  | "session"
  | "cookie"
  | "memory";

export interface IStrategyEvent<Value = unknown> {
  /**
   * The key of the item in the state that triggered the event.
   */
  key: string;

  /**
   * The value associated with the key in the state.
   * This is optional and can be of any type.
   */
  value?: Value;

  /**
   * The strategy type indicating the source of the state change.
   * This will typically be one of the predefined types (local, session, cookie, memory),
   * or a custom strategy type as a string.
   */
  strategy: IStrategy;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
