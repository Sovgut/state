import { Observer } from "~/common/Observer/Observer.ts";
import { StateDoesNotExist } from "~/errors/StateDoesNotExist.ts";
import { StateInvalidCast } from "~/errors/StateInvalidCast.ts";

/**
 * Configuration options for retrieving values from state
 * @template T - The expected type of the value
 */
type Options<T = unknown> = {
  /** If true, throws an error when the key doesn't exist */
  strict?: boolean;
  /** Default value to return when the key doesn't exist or has an empty value */
  fallback?: T;
  /** Cast the value to a specific type */
  cast?: 'string' | 'number' | 'boolean' | 'bigint';
}

/**
 * Configuration options for setting cookies
 */
type CookieOptions = {
  /** Cookie expiration date or number of days from now */
  expires?: Date | number;
  /** Maximum age of the cookie in seconds */
  maxAge?: number;
  /** Domain where the cookie is accessible */
  domain?: string;
  /** Path where the cookie is accessible */
  path?: string;
  /** Whether the cookie should only be transmitted over secure protocols */
  secure?: boolean;
  /** SameSite attribute to prevent CSRF attacks */
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Cookie-based state management class that persists data using browser cookies.
 * Data persists based on cookie expiration settings and is accessible across subdomains.
 * Extends Observer to provide event emission capabilities.
 */
export class CookieState extends Observer {
  /**
   * Retrieves a value from cookies with strict type checking
   * @template T - The expected type of the value
   * @param key - The key to retrieve
   * @param options - Options with strict mode enabled
   * @returns The value associated with the key
   * @throws {StateDoesNotExist} When the key doesn't exist
   * @throws {StateInvalidCast} When casting fails in strict mode
   */
  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  /**
   * Retrieves a value from cookies with a fallback
   * @template T - The expected type of the value
   * @param key - The key to retrieve
   * @param options - Options with a fallback value
   * @returns The value associated with the key or the fallback
   */
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  /**
   * Retrieves a value from cookies
   * @template T - The expected type of the value
   * @param key - The key to retrieve
   * @param options - Optional configuration
   * @returns The value associated with the key or undefined
   */
  static get<T = unknown>(key: string, options?: Options<T>): T | undefined;
  static get<T = unknown>(key: string, options: Options<T> = {}): T | undefined {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));

    if (!cookie) {
      if (options.strict) {
        throw new StateDoesNotExist(key, 'cookies');
      }
      return options.fallback !== undefined ? options.fallback : undefined;
    }

    const value = decodeURIComponent(cookie.split('=')[1]);

    try {
      let parsed = JSON.parse(value) as T;

      if (options.fallback !== undefined &&
        (parsed === null ||
          parsed === undefined ||
          parsed === '' ||
          (Array.isArray(parsed) && parsed.length === 0) ||
          (typeof parsed === 'object' && Object.keys(parsed).length === 0))) {
        return options.fallback;
      }

      if (options.cast) {
        switch (options.cast) {
          case 'string':
            parsed = String(parsed) as T;
            break;
          case 'number':
            parsed = Number(parsed) as T;
            break;
          case 'boolean':
            parsed = Boolean(parsed) as T;
            break;
          case 'bigint':
            parsed = BigInt(String(parsed)) as T;
            break;
        }
      }

      return parsed;
    } catch {
      if (options.cast) {
        try {
          switch (options.cast) {
            case 'string':
              return value as T;
            case 'number':
              return Number(value) as T;
            case 'boolean':
              return (value === 'true' || value === '1') as T;
            case 'bigint':
              return BigInt(value) as T;
          }
        } catch {
          if (options.strict) {
            throw new StateInvalidCast(key, 'cookies', value, options.cast);
          }
          return options.fallback !== undefined ? options.fallback : undefined;
        }
      }

      return value as T;
    }
  }

  /**
   * Stores a value in cookies
   * @template T - The type of the value to store
   * @param key - The key to store the value under
   * @param value - The value to store (will be JSON stringified and URI encoded)
   * @param options - Cookie configuration options
   * @emits Will emit an event with the key and new value
   */
  static set<T = unknown>(key: string, value: T, options?: CookieOptions): void {
    const serialized = JSON.stringify(value);
    const encodedValue = encodeURIComponent(serialized);

    let cookieString = `${key}=${encodedValue}`;

    if (options) {
      if (options.expires) {
        const expiresDate = options.expires instanceof Date
          ? options.expires
          : new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${expiresDate.toUTCString()}`;
      }

      if (options.maxAge !== undefined) {
        cookieString += `; max-age=${options.maxAge}`;
      }

      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }

      if (options.path) {
        cookieString += `; path=${options.path}`;
      }

      if (options.secure) {
        cookieString += '; secure';
      }

      if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
      }
    }

    document.cookie = cookieString;
    CookieState.emit(key, value);
  }

  /**
   * Removes a cookie
   * @param key - The key of the cookie to remove
   * @emits Will emit an event with the key and null value
   */
  static remove(key: string): void {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    CookieState.emit(key, null);
  }

  /**
   * Clears all cookies accessible to the current document
   * @emits Will emit an event for each removed cookie with null value
   */
  static clear(): void {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        CookieState.emit(name, null);
      }
    });
  }

  /**
   * Checks if a cookie exists
   * @param key - The key to check
   * @returns True if the cookie exists, false otherwise
   */
  static has(key: string): boolean {
    return document.cookie.split(';').some(c => c.trim().startsWith(`${key}=`));
  }
}