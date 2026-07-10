/**
 * SSR-safe checks for browser storage APIs.
 *
 * Some environments (Node.js, Web Workers, Safari Private Mode in iframes,
 * sandboxed iframes, certain CSP configurations) make these APIs either
 * undefined or throw on access. All checks here must be exception-safe.
 */

export function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage !== null;
  } catch {
    return false;
  }
}

export function hasSessionStorage(): boolean {
  try {
    return typeof sessionStorage !== "undefined" && sessionStorage !== null;
  } catch {
    return false;
  }
}

export function hasDocumentCookie(): boolean {
  try {
    return typeof document !== "undefined" && document !== null && "cookie" in document;
  } catch {
    return false;
  }
}
