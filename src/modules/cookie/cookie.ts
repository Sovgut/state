import { BaseState } from "../base/base";

export class CookieState extends BaseState {
  static {
    CookieState.strategy = "cookie"
    CookieState.storage = {
      getItem(key: string) {
        const name = key + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(";");
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === " ") {
            c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
          }
        }
        return null;
      },
      setItem(key: string, value: string) {
        const d = new Date();
        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000); // Expires in 1 year
        const expires = "expires=" + d.toUTCString();
        document.cookie = key + "=" + value + ";" + expires + ";path=/";
      },
      removeItem(key: string) {
        document.cookie =
          key + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
      },
      clear() {
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(";");
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substring(0, eqPos) : c;
          document.cookie =
            name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
        }
      },
      has(key: string) {
        return this.getItem(key) !== null;
      },
    };
  }
}
