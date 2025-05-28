# @sovgut/state

<p align="center">
  <img src="https://img.shields.io/npm/v/@sovgut/state" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@sovgut/state" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/sovgut/state" alt="license" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue" alt="TypeScript" />
</p>

<p align="center">
  <b>A lightweight, type-safe, and reactive state management library for modern web applications</b>
</p>

---

## 🚀 Features

- **🎯 Simple & Intuitive API** - Get started in minutes with a familiar localStorage-like API
- **💾 Multiple Storage Strategies** - Choose between localStorage, sessionStorage, cookies, or in-memory storage
- **📦 TypeScript First** - Full TypeScript support with intelligent type inference
- **🔄 Reactive Updates** - Built-in observer pattern for real-time state synchronization
- **🛡️ Type Safety** - Automatic type casting and validation with custom error handling
- **🪶 Lightweight** - Zero dependencies, minimal bundle size
- **🔧 Flexible Configuration** - Fallback values, strict mode, and custom casting options
- **🍪 Advanced Cookie Support** - Full cookie options including SameSite, Secure, and expiration

## 📦 Installation

```bash
npm install @sovgut/state
```

```bash
yarn add @sovgut/state
```

```bash
pnpm add @sovgut/state
```

## 🎯 Quick Start

```typescript
import { LocalState, SessionState, MemoryState, CookieState } from "@sovgut/state";

// Store a value
LocalState.set("user", { name: "John", age: 30 });

// Retrieve a value
const user = LocalState.get("user");

// Listen for changes
LocalState.on("user", (event) => {
  console.log("User updated:", event);
});
```

## 📖 Table of Contents

- [Storage Strategies](#storage-strategies)
- [Basic Usage](#basic-usage)
- [Type Safety & Casting](#type-safety--casting)
- [Observer Pattern](#observer-pattern)
- [React Integration](#react-integration)
- [API Reference](#api-reference)
- [Advanced Patterns](#advanced-patterns)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## 💾 Storage Strategies

### LocalState
Persists data in `localStorage` - survives browser restarts.

```typescript
import { LocalState } from "@sovgut/state";

LocalState.set("theme", "dark");
const theme = LocalState.get("theme"); // "dark"
```

### SessionState
Stores data in `sessionStorage` - cleared when tab closes.

```typescript
import { SessionState } from "@sovgut/state";

SessionState.set("tempData", { expires: Date.now() + 3600000 });
const data = SessionState.get("tempData");
```

### MemoryState
In-memory storage - cleared on page reload.

```typescript
import { MemoryState } from "@sovgut/state";

MemoryState.set("cache", new Map([["key", "value"]]));
const cache = MemoryState.get("cache");
```

### CookieState
HTTP cookie storage with advanced options.

```typescript
import { CookieState } from "@sovgut/state";

CookieState.set("sessionId", "abc123", {
  expires: 7, // days
  secure: true,
  sameSite: "strict"
});
```

## 🔧 Basic Usage

### Setting Values

All storage types support any serializable JavaScript value:

```typescript
// Primitives
LocalState.set("count", 42);
LocalState.set("name", "Alice");
LocalState.set("isActive", true);
LocalState.set("bigNumber", 9007199254740991n);

// Objects and Arrays
LocalState.set("user", { id: 1, name: "Bob" });
LocalState.set("tags", ["javascript", "typescript"]);

// Complex structures
LocalState.set("settings", {
  theme: "dark",
  notifications: {
    email: true,
    push: false
  },
  favorites: ["dashboard", "profile"]
});
```

### Getting Values

#### Basic Retrieval

```typescript
const count = LocalState.get("count"); // 42
const user = LocalState.get("user"); // { id: 1, name: "Bob" }
const missing = LocalState.get("nonexistent"); // undefined
```

#### With Fallback Values

```typescript
// Returns fallback if key doesn't exist
const theme = LocalState.get("theme", { fallback: "light" }); // "light"

// Fallback also determines the return type
const score = LocalState.get("score", { fallback: 0 }); // number
const tags = LocalState.get("tags", { fallback: [] as string[] }); // string[]
```

#### Strict Mode

```typescript
// Throws StateDoesNotExist error if key is missing
try {
  const required = LocalState.get("required", { strict: true });
} catch (error) {
  console.error("Key does not exist:", error.message);
}
```

### Removing Values

```typescript
// Remove single item
LocalState.remove("user");

// Clear all items
LocalState.clear();

// Check existence
if (LocalState.has("user")) {
  LocalState.remove("user");
}
```

## 🎭 Type Safety & Casting

### Automatic Type Inference

```typescript
// TypeScript infers types from fallback values
const count = LocalState.get("count", { fallback: 0 }); // number
const name = LocalState.get("name", { fallback: "" }); // string
const items = LocalState.get("items", { fallback: [] as Item[] }); // Item[]
```

### Explicit Type Casting

```typescript
// Cast stored values to specific types
LocalState.set("stringNumber", "42");

const asString = LocalState.get("stringNumber", { cast: "string" }); // "42"
const asNumber = LocalState.get("stringNumber", { cast: "number" }); // 42
const asBoolean = LocalState.get("stringNumber", { cast: "boolean" }); // true
const asBigInt = LocalState.get("stringNumber", { cast: "bigint" }); // 42n
```

### Generic Type Parameters

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Explicitly type the return value
const user = LocalState.get<User>("currentUser");

// With strict mode
const user = LocalState.get<User>("currentUser", { strict: true });
```

## 👁️ Observer Pattern

### Event Listeners

```typescript
import { type IStorageEventData } from "@sovgut/state";

// Listen for all changes to a key
LocalState.on("user", (event: IStorageEventData) => {
  console.log("User changed:", event);
});

// Listen once
LocalState.once("notification", (event) => {
  console.log("Notification received:", event);
});

// Remove specific listener
const handler = (event: IStorageEventData) => console.log(event);
LocalState.on("data", handler);
LocalState.off("data", handler);

// Remove all listeners
LocalState.removeAllListeners();
```

### Cross-Component State Sync

```typescript
// Component A
LocalState.set("sharedState", { count: 1 });

// Component B - automatically receives updates
LocalState.on("sharedState", (event) => {
  console.log("State updated in Component A:", event);
});
```

## ⚛️ React Integration

### Custom Hook Example

```typescript
import { useEffect, useState, useCallback } from "react";
import { LocalState, type IStorageEventData } from "@sovgut/state";

function useLocalState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => 
    LocalState.get(key, { fallback: initialValue })
  );

  useEffect(() => {
    const handler = (event: IStorageEventData<T>) => {
      setValue(event ?? initialValue);
    };

    LocalState.on(key, handler);
    return () => LocalState.off(key, handler);
  }, [key, initialValue]);

  const updateValue = useCallback((newValue: T) => {
    LocalState.set(key, newValue);
  }, [key]);

  return [value, updateValue] as const;
}

// Usage
function App() {
  const [theme, setTheme] = useLocalState("theme", "light");
  
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  );
}
```

### Context Provider Pattern

```typescript
import React, { createContext, useContext, useEffect, useState } from "react";
import { LocalState, type IStorageEventData } from "@sovgut/state";

interface AppState {
  user: User | null;
  settings: Settings;
}

const StateContext = createContext<{
  state: AppState;
  updateUser: (user: User | null) => void;
  updateSettings: (settings: Settings) => void;
}>({} as any);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: LocalState.get("user", { fallback: null }),
    settings: LocalState.get("settings", { fallback: defaultSettings })
  });

  useEffect(() => {
    const handleUserChange = (event: IStorageEventData<User>) => {
      setState(prev => ({ ...prev, user: event }));
    };

    const handleSettingsChange = (event: IStorageEventData<Settings>) => {
      setState(prev => ({ ...prev, settings: event ?? defaultSettings }));
    };

    LocalState.on("user", handleUserChange);
    LocalState.on("settings", handleSettingsChange);

    return () => {
      LocalState.off("user", handleUserChange);
      LocalState.off("settings", handleSettingsChange);
    };
  }, []);

  const updateUser = (user: User | null) => LocalState.set("user", user);
  const updateSettings = (settings: Settings) => LocalState.set("settings", settings);

  return (
    <StateContext.Provider value={{ state, updateUser, updateSettings }}>
      {children}
    </StateContext.Provider>
  );
}

export const useAppState = () => useContext(StateContext);
```

## 📚 API Reference

### Common Methods

All storage classes (`LocalState`, `SessionState`, `MemoryState`, `CookieState`) share these methods:

#### `get<T>(key: string, options?: GetOptions<T>): T | undefined`

Retrieves a value from storage.

**Options:**
- `fallback?: T` - Default value if key doesn't exist
- `strict?: boolean` - Throw error if key doesn't exist
- `cast?: 'string' | 'number' | 'boolean' | 'bigint'` - Type casting

#### `set<T>(key: string, value: T, options?: SetOptions): void`

Stores a value in storage.

**Cookie-specific options:**
- `expires?: Date | number` - Expiration date or days from now
- `maxAge?: number` - Maximum age in seconds
- `domain?: string` - Cookie domain
- `path?: string` - Cookie path
- `secure?: boolean` - HTTPS only
- `sameSite?: 'strict' | 'lax' | 'none'` - CSRF protection

#### `remove(key: string): void`

Removes a value from storage.

#### `clear(): void`

Removes all values from storage.

#### `has(key: string): boolean`

Checks if a key exists in storage.

### Observer Methods

#### `on<T>(event: string, callback: (event: IStorageEventData<T>) => void): void`

Adds an event listener.

#### `once<T>(event: string, callback: (event: IStorageEventData<T>) => void): void`

Adds a one-time event listener.

#### `off<T>(event: string, callback: (event: IStorageEventData<T>) => void): void`

Removes an event listener.

#### `removeAllListeners(): void`

Removes all event listeners.

## 🎨 Advanced Patterns

### Namespaced Keys

```typescript
class UserState {
  private static prefix = "user:";

  static set(key: string, value: unknown) {
    LocalState.set(`${this.prefix}${key}`, value);
  }

  static get<T>(key: string, options?: GetOptions<T>) {
    return LocalState.get<T>(`${this.prefix}${key}`, options);
  }

  static remove(key: string) {
    LocalState.remove(`${this.prefix}${key}`);
  }

  static clear() {
    // Clear only user-prefixed keys
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix));
    
    keys.forEach(key => {
      LocalState.remove(key.replace(this.prefix, ""));
    });
  }
}

// Usage
UserState.set("profile", { name: "Alice" });
UserState.set("preferences", { theme: "dark" });
const profile = UserState.get("profile");
```

### State Migrations

```typescript
class MigrationManager {
  static migrate() {
    const version = LocalState.get("schema_version", { fallback: 0 });

    if (version < 1) {
      // Migrate from v0 to v1
      const oldUser = LocalState.get("user_name");
      if (oldUser) {
        LocalState.set("user", { name: oldUser, version: 1 });
        LocalState.remove("user_name");
      }
      LocalState.set("schema_version", 1);
    }

    if (version < 2) {
      // Migrate from v1 to v2
      const user = LocalState.get<any>("user");
      if (user) {
        LocalState.set("user", { ...user, createdAt: Date.now(), version: 2 });
      }
      LocalState.set("schema_version", 2);
    }
  }
}

// Run migrations on app start
MigrationManager.migrate();
```

### Computed State

```typescript
class ComputedState {
  static getTotalPrice() {
    const items = LocalState.get<CartItem[]>("cart", { fallback: [] });
    const taxRate = LocalState.get("taxRate", { fallback: 0.08 });
    
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return subtotal * (1 + taxRate);
  }

  static getIsLoggedIn() {
    return LocalState.has("user") && LocalState.has("authToken");
  }

  static getUserDisplayName() {
    const user = LocalState.get<User>("user");
    return user?.displayName || user?.email || "Guest";
  }
}
```

### State Persistence Middleware

```typescript
class PersistenceMiddleware {
  private static syncTargets = new Map<string, 'local' | 'session' | 'memory' | 'cookie'>();

  static sync(key: string, from: 'local' | 'session', to: 'local' | 'session') {
    const sources = {
      local: LocalState,
      session: SessionState
    };

    const source = sources[from];
    const target = sources[to];

    // Initial sync
    const value = source.get(key);
    if (value !== undefined) {
      target.set(key, value);
    }

    // Continuous sync
    source.on(key, (event) => {
      if (event === null) {
        target.remove(key);
      } else {
        target.set(key, event);
      }
    });
  }
}

// Keep auth token in sync between local and session storage
PersistenceMiddleware.sync("authToken", "local", "session");
```

## 🛡️ Error Handling

### Built-in Error Types

```typescript
import { StateDoesNotExist, StateInvalidCast } from "@sovgut/state";

// Handle missing keys
try {
  const data = LocalState.get("required", { strict: true });
} catch (error) {
  if (error instanceof StateDoesNotExist) {
    console.error(`Key "${error.key}" not found in ${error.storage}`);
  }
}

// Handle invalid casts
try {
  LocalState.set("invalid", "not-a-number");
  const num = LocalState.get("invalid", { cast: "number", strict: true });
} catch (error) {
  if (error instanceof StateInvalidCast) {
    console.error(`Cannot cast "${error.value}" to ${error.type}`);
  }
}
```

### Safe Wrappers

```typescript
class SafeState {
  static get<T>(key: string, defaultValue: T): T {
    try {
      return LocalState.get(key, { fallback: defaultValue }) ?? defaultValue;
    } catch {
      console.warn(`Failed to get "${key}", using default value`);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): boolean {
    try {
      LocalState.set(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to set "${key}":`, error);
      return false;
    }
  }
}
```

## 🏆 Best Practices

### 1. Use TypeScript Interfaces

```typescript
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr';
}

class TypedState {
  static get<K extends keyof AppState>(key: K): AppState[K] | undefined {
    return LocalState.get(key);
  }

  static set<K extends keyof AppState>(key: K, value: AppState[K]): void {
    LocalState.set(key, value);
  }
}
```

### 2. Centralize State Keys

```typescript
const StateKeys = {
  USER: 'user',
  THEME: 'theme',
  CART: 'cart',
  PREFERENCES: 'preferences'
} as const;

// Usage
LocalState.set(StateKeys.USER, currentUser);
const theme = LocalState.get(StateKeys.THEME);
```

### 3. Create Domain-Specific Stores

```typescript
class AuthStore {
  static setUser(user: User) {
    LocalState.set('auth:user', user);
    LocalState.set('auth:lastLogin', Date.now());
  }

  static getUser() {
    return LocalState.get<User>('auth:user');
  }

  static logout() {
    LocalState.remove('auth:user');
    LocalState.remove('auth:token');
    LocalState.remove('auth:lastLogin');
  }

  static isAuthenticated() {
    return LocalState.has('auth:user') && LocalState.has('auth:token');
  }
}
```

### 4. Handle Storage Quota Errors

```typescript
class QuotaSafeState {
  static set<T>(key: string, value: T): boolean {
    try {
      LocalState.set(key, value);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Try to clear old data
        this.clearOldData();
        
        // Retry
        try {
          LocalState.set(key, value);
          return true;
        } catch {
          console.error('Storage quota exceeded');
          return false;
        }
      }
      throw error;
    }
  }

  private static clearOldData() {
    // Implement your cleanup strategy
    const keys = Object.keys(localStorage);
    const oldKeys = keys.filter(key => {
      const data = LocalState.get<any>(key);
      return data?.timestamp && Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000;
    });
    
    oldKeys.forEach(key => LocalState.remove(key));
  }
}
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ by [sovgut](https://github.com/sovgut)

---

<p align="center">
  <a href="https://github.com/sovgut/state">GitHub</a> •
  <a href="https://www.npmjs.com/package/@sovgut/state">npm</a> •
  <a href="#api-reference">Documentation</a>
</p>
