import { Observer } from "~/common/Observer/Observer.ts";
import { StateDoesNotExist } from "~/errors/StateDoesNotExist.ts";
import { StateInvalidCast } from "~/errors/StateInvalidCast.ts";

type Options<T = unknown> = {
  strict?: boolean;
  fallback?: T;
  cast?: 'string' | 'number' | 'boolean' | 'bigint';
}

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

export class CookieState extends Observer {
  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
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

      // Check for empty values when fallback is enabled
      if (options.fallback !== undefined &&
        (parsed === null ||
          parsed === undefined ||
          parsed === '' ||
          (Array.isArray(parsed) && parsed.length === 0) ||
          (typeof parsed === 'object' && Object.keys(parsed).length === 0))) {
        return options.fallback;
      }

      // Apply casting if specified
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
      // If parsing fails, try to cast the raw string value if cast option is specified
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
          // If casting fails, return fallback or undefined or throw based on strict mode
          if (options.strict) {
            throw new StateInvalidCast(key, 'cookies', value, options.cast);
          }
          return options.fallback !== undefined ? options.fallback : undefined;
        }
      }

      // If no casting and parsing failed, return the raw string value
      return value as T;
    }
  }

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

  static remove(key: string): void {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    CookieState.emit(key, null);
  }

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

  static has(key: string): boolean {
    return document.cookie.split(';').some(c => c.trim().startsWith(`${key}=`));
  }
}