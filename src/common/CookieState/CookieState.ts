import { hasDocumentCookie } from "~/common/internal/env.ts";
import { type Options, resolveValue } from "~/common/internal/resolveValue.ts";
import { Observer } from "~/common/Observer/Observer.ts";

const STORAGE_NAME = "cookies";

/**
 * Most browsers cap individual cookies at ~4096 bytes (name + value + attributes).
 * Going over this limit causes the browser to silently DROP the write — no error
 * is raised. We can't enforce a hard limit (browsers differ slightly), so we warn.
 */
const MAX_COOKIE_SIZE = 4096;

/**
 * Configuration options for setting cookies.
 */
export type CookieOptions = {
  /** Expiration date or number of days from now. */
  expires?: Date | number;
  /** Maximum age of the cookie in seconds. Takes precedence over `expires` in modern browsers. */
  maxAge?: number;
  /** Domain where the cookie is accessible. */
  domain?: string;
  /** Path where the cookie is accessible. Defaults to `/`. */
  path?: string;
  /** Send only over HTTPS. Auto-enabled when `sameSite: 'none'`. */
  secure?: boolean;
  /** SameSite attribute. Defaults to `'lax'` (matches modern browser defaults). */
  sameSite?: "strict" | "lax" | "none";
};

/**
 * RFC 6265 forbids these characters in cookie names: control characters,
 * whitespace, and any of: () < > @ , ; : \ " / [ ] ? = { }
 */
// RFC 6265 separators/special characters (control characters are checked separately
// so we don't have to embed unsafe control-char ranges in a regex literal).
const INVALID_COOKIE_NAME_CHARS = /[()<>@,;:\\"/[\]?={}]/;

function isValidCookieName(name: string): boolean {
  if (typeof name !== "string" || name.length === 0) return false;
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i);
    // Reject control characters (0x00–0x20), space, and DEL (0x7F).
    if (code <= 0x20 || code === 0x7f) return false;
  }
  return !INVALID_COOKIE_NAME_CHARS.test(name);
}

/**
 * Reads the raw decoded value of a cookie, or null if absent.
 * Safe against `=` chars in the value (uses indexOf instead of split).
 */
function readCookie(key: string): string | null {
  if (!hasDocumentCookie()) return null;

  let raw: string;
  try {
    raw = document.cookie;
  } catch {
    return null;
  }

  if (!raw) return null;

  const prefix = `${key}=`;
  const cookies = raw.split(";");

  for (const c of cookies) {
    const trimmed = c.trim();
    if (trimmed.indexOf(prefix) === 0) {
      const value = trimmed.substring(prefix.length);
      try {
        return decodeURIComponent(value);
      } catch {
        // Malformed URI encoding — return raw rather than throwing
        return value;
      }
    }
  }

  return null;
}

/**
 * Cookie-backed state management.
 *
 * Defaults applied by `set()`:
 *  - `path: '/'`   — cookie is readable from every page of the host.
 *    Without this, browsers scope the cookie to the path of the page that
 *    wrote it, which is almost never what you want and was the root cause
 *    of the "cookies don't persist between pages" bug.
 *  - `sameSite: 'lax'` — matches modern browser defaults and avoids warnings.
 *  - `secure` auto-enabled when `sameSite: 'none'` (browser requirement).
 */
export class CookieState extends Observer {
  static get<T = unknown>(key: string, options: Options<T> & { strict: true }): T;
  static get<T = unknown>(key: string, options: Options<T> & { fallback: T }): T;
  static get<T = unknown>(key: string, options?: Options<T>): T | undefined;
  static get<T = unknown>(key: string, options: Options<T> = {}): T | undefined {
    const raw = readCookie(key);

    if (raw === null) {
      return resolveValue<T>({ found: false }, options, STORAGE_NAME, key);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Cookie was written by something other than this library — treat as string
      parsed = raw;
    }

    return resolveValue<T>({ found: true, value: parsed }, options, STORAGE_NAME, key);
  }

  /**
   * Stores a value as a cookie.
   *
   * @throws when the cookie name contains forbidden characters, when the
   *         value is not JSON-serialisable, or when SameSite=None is used
   *         without Secure (browser would reject it silently).
   */
  static set<T = unknown>(key: string, value: T, options: CookieOptions = {}): void {
    if (!hasDocumentCookie()) {
      throw new Error("document.cookie is not available in this environment.");
    }

    if (!isValidCookieName(key)) {
      throw new Error(
        `Invalid cookie name "${key}": names cannot be empty or contain whitespace, control characters, or any of: ()<>@,;:\\"/[]?={}`
      );
    }

    let serialized: string | undefined;
    try {
      serialized = JSON.stringify(value);
    } catch (err) {
      throw new Error(`Cannot serialize cookie value for key "${key}": ${(err as Error).message}`);
    }

    if (serialized === undefined) {
      throw new Error(`Cannot set cookie "${key}": value is not serializable (undefined, function, or symbol).`);
    }

    // --- Defaults --------------------------------------------------------
    const path = options.path ?? "/";
    const sameSite = options.sameSite ?? "lax";
    // SameSite=None REQUIRES Secure in modern browsers. Enable automatically
    // if not explicitly set, and fail loudly if the user opted out.
    const secure = options.secure ?? sameSite === "none";

    if (sameSite === "none" && !secure) {
      throw new Error(
        `Cookie "${key}": SameSite=None requires Secure=true. The browser will silently reject this cookie.`
      );
    }

    // --- Build cookie string --------------------------------------------
    const encoded = encodeURIComponent(serialized);
    let cookieString = `${key}=${encoded}`;

    if (options.expires !== undefined) {
      const expiresDate =
        options.expires instanceof Date
          ? options.expires
          : new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000);

      if (Number.isNaN(expiresDate.getTime())) {
        throw new Error(`Invalid 'expires' value for cookie "${key}".`);
      }
      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }

    if (options.maxAge !== undefined) {
      if (!Number.isFinite(options.maxAge)) {
        throw new Error(`Invalid 'maxAge' value for cookie "${key}".`);
      }
      cookieString += `; max-age=${Math.floor(options.maxAge)}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    cookieString += `; path=${path}`;

    if (secure) {
      cookieString += "; secure";
    }

    cookieString += `; samesite=${sameSite}`;

    // Warn about size — browsers silently drop oversized cookies.
    if (cookieString.length > MAX_COOKIE_SIZE) {
      console.warn(
        `[CookieState] Cookie "${key}" is ${cookieString.length} bytes, ` +
          `which exceeds the typical ${MAX_COOKIE_SIZE}-byte per-cookie limit. ` +
          `The browser may silently drop it.`
      );
    }

    try {
      document.cookie = cookieString;
    } catch (err) {
      throw new Error(`Failed to set cookie "${key}": ${(err as Error).message}`);
    }

    CookieState.emit(key, value);
  }

  /**
   * Removes a cookie.
   *
   * IMPORTANT: to successfully delete a cookie, `path` and `domain` MUST
   * match the values used when the cookie was set. By default this method
   * uses `path: '/'`, which matches the default of `set()`. If you set a
   * cookie with a custom path or domain, pass the same values here.
   */
  static remove(key: string, options: Pick<CookieOptions, "path" | "domain"> = {}): void {
    if (!hasDocumentCookie()) return;

    const path = options.path ?? "/";

    let cookieString = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    try {
      document.cookie = cookieString;
    } catch {
      // ignore — best-effort
    }

    CookieState.emit(key, null);
  }

  /**
   * Clears all cookies visible to the current document at `path=/`.
   *
   * Caveat: cookies set with a non-default `path` or `domain` may NOT be
   * cleared, because browsers require exact path/domain match to delete.
   */
  static clear(): void {
    if (!hasDocumentCookie()) return;

    let raw: string;
    try {
      raw = document.cookie;
    } catch {
      return;
    }

    if (!raw) return;

    const cookies = raw.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = (eqPos > -1 ? cookie.substring(0, eqPos) : cookie).trim();
      if (!name) continue;

      try {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      } catch {
        // ignore
      }
      CookieState.emit(name, null);
    }
  }

  static has(key: string): boolean {
    return readCookie(key) !== null;
  }
}
