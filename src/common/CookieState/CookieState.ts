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
    const cookie = cookies.find(c => {
      const trimmed = c.trim();
      return trimmed.startsWith(`${key}=`) || trimmed === key;
    });

    if (!cookie) {
      if (options.strict) {
        throw new StateDoesNotExist(key, 'cookies');
      }
      return options.fallback !== undefined ? options.fallback : undefined;
    }

    // Fix: Handle cookies with multiple '=' in value
    const [_cookieKey, ...valueParts] = cookie.trim().split('=');
    const value = valueParts.join('='); // Rejoin in case value contains '='
    
    if (!value) {
      if (options.strict) {
        throw new StateDoesNotExist(key, 'cookies');
      }
      return options.fallback !== undefined ? options.fallback : undefined;
    }

    const decodedValue = decodeURIComponent(value);

    try {
      let parsed = JSON.parse(decodedValue) as T;

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
              return decodedValue as T;
            case 'number':
              return Number(decodedValue) as T;
            case 'boolean':
              return (decodedValue === 'true' || decodedValue === '1') as T;
            case 'bigint':
              return BigInt(decodedValue) as T;
          }
        } catch {
          // If casting fails, return fallback or undefined or throw based on strict mode
          if (options.strict) {
            throw new StateInvalidCast(decodedValue, options.cast);
          }
          return options.fallback !== undefined ? options.fallback : undefined;
        }
      }

      // If no casting and parsing failed, return the raw string value
      return decodedValue as T;
    }
  }

  static set<T = unknown>(key: string, value: T, options?: CookieOptions): void {
    const serialized = JSON.stringify(value);
    const encodedValue = encodeURIComponent(serialized);

    let cookieString = `${key}=${encodedValue}`;

    // Set default path to root if not specified
    const cookiePath = options?.path || '/';
    cookieString += `; path=${cookiePath}`;

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

      // Only add secure flag if explicitly set to true
      if (options.secure === true) {
        cookieString += `; Secure`;  // Fix: Capitalize 'Secure'
      }

      if (options.sameSite) {
        cookieString += `; SameSite=${options.sameSite}`;  // Fix: Capitalize 'SameSite'
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