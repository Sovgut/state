# @sovgut/state

Type-safe, synchronous state management for the browser with a unified API over `localStorage`, `sessionStorage`, cookies, and in-memory storage. Each backend exposes the same interface and an isolated observer for change notifications.

[![npm version](https://img.shields.io/npm/v/@sovgut/state)](https://www.npmjs.com/package/@sovgut/state)
[![npm downloads](https://img.shields.io/npm/dm/@sovgut/state)](https://www.npmjs.com/package/@sovgut/state)
[![license](https://img.shields.io/github/license/sovgut/state)](./LICENSE)

## Contents

- [Installation](#installation)
- [Overview](#overview)
- [Storage backends](#storage-backends)
- [Reading and writing values](#reading-and-writing-values)
- [Type casting](#type-casting)
- [Observing changes](#observing-changes)
- [React integration](#react-integration)
- [API reference](#api-reference)
- [Error handling](#error-handling)
- [License](#license)

## Installation

```bash
npm install @sovgut/state
```

```bash
yarn add @sovgut/state
```

```bash
pnpm add @sovgut/state
```

The package ships as ES modules with bundled type declarations and has no runtime dependencies.

## Overview

```typescript
import { LocalState } from "@sovgut/state";

LocalState.set("user", { id: 1, name: "Alice" });

const user = LocalState.get("user");

LocalState.on("user", (value) => {
  console.log("user changed:", value);
});
```

`LocalState`, `SessionState`, `MemoryState`, and `CookieState` are static classes. There is nothing to instantiate; import a backend and call its methods directly.

## Storage backends

All backends share the same core interface. They differ in where data is stored and how long it survives.

| Backend        | Storage             | Lifetime                              |
| -------------- | ------------------- | ------------------------------------- |
| `LocalState`   | `localStorage`      | Persists across browser sessions      |
| `SessionState` | `sessionStorage`    | Cleared when the tab is closed        |
| `MemoryState`  | In-memory `Map`     | Cleared on page reload                |
| `CookieState`  | `document.cookie`   | Configurable via cookie attributes    |

### LocalState

```typescript
import { LocalState } from "@sovgut/state";

LocalState.set("theme", "dark");
const theme = LocalState.get("theme"); // "dark"
```

### SessionState

```typescript
import { SessionState } from "@sovgut/state";

SessionState.set("draft", { subject: "", body: "" });
const draft = SessionState.get("draft");
```

### MemoryState

Values are stored by reference without a JSON roundtrip, so `Date`, `Map`, `Set`, and class instances survive a get/set cycle unchanged. Stored objects are not defensively copied.

```typescript
import { MemoryState } from "@sovgut/state";

MemoryState.set("cache", new Map([["key", "value"]]));
const cache = MemoryState.get<Map<string, string>>("cache");
```

### CookieState

`set` accepts standard cookie attributes. `path` defaults to `/` and `sameSite` defaults to `lax`. When `sameSite` is `none`, `secure` is enabled automatically.

```typescript
import { CookieState } from "@sovgut/state";

CookieState.set("sessionId", "abc123", {
  expires: 7,        // days from now, or a Date
  secure: true,
  sameSite: "strict",
});
```

Cookies set with a custom `path` or `domain` must be removed with the same values, because browsers require an exact match to delete a cookie:

```typescript
CookieState.set("token", value, { path: "/admin" });
CookieState.remove("token", { path: "/admin" });
```

## Reading and writing values

### Writing

Values written to `LocalState`, `SessionState`, and `CookieState` are JSON-serialized. A value that cannot be serialized — `undefined`, a function, a symbol, or a circular reference — causes `set` to throw.

```typescript
LocalState.set("count", 42);
LocalState.set("name", "Alice");
LocalState.set("isActive", true);
LocalState.set("tags", ["typescript", "state"]);
LocalState.set("settings", {
  theme: "dark",
  notifications: { email: true, push: false },
});
```

### Reading

`get` returns the stored value, or `undefined` when the key is absent.

```typescript
const count = LocalState.get("count");        // 42
const missing = LocalState.get("nonexistent"); // undefined
```

Provide a `fallback` to return a default when the key is absent or holds an empty value. The fallback also drives the inferred return type.

```typescript
const theme = LocalState.get("theme", { fallback: "light" }); // string
const score = LocalState.get("score", { fallback: 0 });       // number
const tags = LocalState.get("tags", { fallback: [] as string[] }); // string[]
```

Use `strict` to throw `StateDoesNotExist` when the key is absent.

```typescript
try {
  const token = LocalState.get("token", { strict: true });
} catch (error) {
  // key was not present
}
```

### Removing and checking

```typescript
LocalState.remove("user");   // remove one key
LocalState.clear();          // remove all keys for this backend
LocalState.has("user");      // boolean
```

## Type casting

Provide a `cast` option to coerce a stored value to a primitive type. Supported targets are `"string"`, `"number"`, `"boolean"`, and `"bigint"`.

```typescript
LocalState.set("value", "42");

LocalState.get("value", { cast: "string" });  // "42"
LocalState.get("value", { cast: "number" });  // 42
LocalState.get("value", { cast: "boolean" }); // true
LocalState.get("value", { cast: "bigint" });  // 42n
```

An impossible cast — for example `"abc"` to `number` — returns the `fallback` when one is provided, or throws `StateInvalidCast` when `strict` is set. Boolean casting treats `"false"`, `"0"`, and `""` as `false`.

A generic parameter can be supplied to type the return value directly:

```typescript
interface User {
  id: number;
  name: string;
}

const user = LocalState.get<User>("currentUser");
const required = LocalState.get<User>("currentUser", { strict: true });
```

## Observing changes

Each backend maintains its own listener registry, so `LocalState` listeners do not fire on `SessionState` events. Listeners receive the new value, or `null` when a key is removed or cleared.

```typescript
const handler = (value) => console.log("changed:", value);

LocalState.on("user", handler);   // subscribe
LocalState.once("user", handler); // fire at most once
LocalState.off("user", handler);  // unsubscribe
```

Note: storing an explicit `null` via `set` emits `null` as well, so a listener cannot distinguish "set to null" from "removed" by the payload alone.

Additional inspection and cleanup methods are available:

```typescript
LocalState.listenerCount("user");   // number of listeners for a key
LocalState.eventNames();            // keys with at least one listener
LocalState.removeListener("user");  // remove all listeners for one key
LocalState.removeAllListeners();    // remove every listener on the backend
```

A listener that throws is isolated: the error is logged and other listeners still run.

## React integration

The library is framework-agnostic. A minimal hook that keeps component state synchronized with a backend:

```typescript
import { useCallback, useEffect, useState } from "react";
import { LocalState, type IStorageEventData } from "@sovgut/state";

function useLocalState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() =>
    LocalState.get(key, { fallback: initialValue }),
  );

  useEffect(() => {
    const handler = (event: IStorageEventData<T>) => {
      setValue(event ?? initialValue);
    };

    LocalState.on(key, handler);
    return () => LocalState.off(key, handler);
  }, [key, initialValue]);

  const update = useCallback(
    (next: T) => LocalState.set(key, next),
    [key],
  );

  return [value, update] as const;
}

function ThemeToggle() {
  const [theme, setTheme] = useLocalState("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme}
    </button>
  );
}
```

## API reference

The methods below are shared by all four backends unless noted otherwise.

### `get<T>(key, options?): T | undefined`

Retrieves a value from storage.

| Option     | Type                                          | Description                                          |
| ---------- | --------------------------------------------- | ---------------------------------------------------- |
| `fallback` | `T`                                           | Returned when the key is absent or holds an empty value. |
| `strict`   | `boolean`                                     | Throw `StateDoesNotExist` when the key is absent.    |
| `cast`     | `"string" \| "number" \| "boolean" \| "bigint"` | Coerce the stored value to a primitive type.      |

### `set<T>(key, value): void`

Stores a value. Throws when the value cannot be serialized or the backend rejects the write. `CookieState.set(key, value, options?)` additionally accepts cookie attributes:

| Option     | Type                             | Description                                             |
| ---------- | -------------------------------- | ------------------------------------------------------- |
| `expires`  | `Date \| number`                 | Expiration date, or number of days from now.            |
| `maxAge`   | `number`                         | Maximum age in seconds. Takes precedence over `expires`.|
| `domain`   | `string`                         | Domain the cookie is scoped to.                         |
| `path`     | `string`                         | Path the cookie is scoped to. Defaults to `/`.          |
| `secure`   | `boolean`                        | Send only over HTTPS. Required when `sameSite` is `none`. |
| `sameSite` | `"strict" \| "lax" \| "none"`    | SameSite policy. Defaults to `lax`.                     |

### `remove(key): void`

Removes a value. `CookieState.remove(key, options?)` accepts `path` and `domain`, which must match the values used when the cookie was set.

### `clear(): void`

Removes every value for the backend and emits `null` for each removed key.

### `has(key): boolean`

Returns whether a key exists.

### Observer methods

| Method                        | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `on(event, callback)`         | Add a listener.                                  |
| `once(event, callback)`       | Add a listener that fires at most once.          |
| `off(event, callback)`        | Remove a specific listener.                      |
| `removeListener(event)`       | Remove all listeners for one key.                |
| `removeAllListeners()`        | Remove every listener on the backend.            |
| `listenerCount(event)`        | Number of listeners registered for a key.        |
| `eventNames()`                | Keys that have at least one listener.            |

## Error handling

Both error types carry structured fields for programmatic handling.

```typescript
import { StateDoesNotExist, StateInvalidCast } from "@sovgut/state";

try {
  LocalState.get("token", { strict: true });
} catch (error) {
  if (error instanceof StateDoesNotExist) {
    console.error(`"${error.key}" not found in ${error.storage}`);
  }
}

try {
  LocalState.set("value", "not-a-number");
  LocalState.get("value", { cast: "number", strict: true });
} catch (error) {
  if (error instanceof StateInvalidCast) {
    console.error(
      `cannot cast "${error.value}" to ${error.type} for "${error.key}"`,
    );
  }
}
```

## License

Released under the [MIT License](./LICENSE).
