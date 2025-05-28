import { CookieState } from './CookieState';

export class CookieDebug {
  /**
   * Test cookie functionality and return diagnostic information
   */
  static diagnose(): {
    canSetCookies: boolean;
    canReadCookies: boolean;
    isSecureContext: boolean;
    cookieEnabled: boolean;
    domain: string;
    protocol: string;
    pathname: string;
    errors: string[];
  } {
    const errors: string[] = [];
    const testKey = '__cookie_test__';
    const testValue = 'test';
    
    // Check browser cookie support
    const cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled) {
      errors.push('Cookies are disabled in browser settings');
    }

    // Check secure context
    const isSecureContext = window.isSecureContext;
    
    // Try to set a test cookie
    let canSetCookies = false;
    try {
      document.cookie = `${testKey}=${testValue}; path=/`;
      canSetCookies = document.cookie.includes(testKey);
      
      if (!canSetCookies) {
        errors.push('Unable to set cookies - might be blocked by browser policy');
      }
      
      // Clean up test cookie
      document.cookie = `${testKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    } catch (e: any) {
      errors.push(`Cookie set error: ${e.message}`);
    }

    // Try to read cookies
    let canReadCookies = false;
    try {
      canReadCookies = typeof document.cookie === 'string';
      if (!canReadCookies) {
        errors.push('Unable to read document.cookie');
      }
    } catch (e: any) {
      errors.push(`Cookie read error: ${e.message}`);
    }

    return {
      canSetCookies,
      canReadCookies,
      isSecureContext,
      cookieEnabled,
      domain: window.location.hostname,
      protocol: window.location.protocol,
      pathname: window.location.pathname,
      errors
    };
  }

  /**
   * Get all current cookies in a readable format
   */
  static getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    document.cookie.split(';').forEach(cookie => {
      const [key, ...valueParts] = cookie.trim().split('=');
      if (key) {
        cookies[key] = valueParts.join('=');
      }
    });
    
    return cookies;
  }

  /**
   * Try different cookie configurations to see what works
   */
  static testConfigurations(key: string = 'test_cookie', value: any = 'test_value'): void {
    const configs = [
      { name: 'Basic', options: {} },
      { name: 'With Path', options: { path: '/' } },
      { name: 'With Expires', options: { expires: 1 } },
      { name: 'With MaxAge', options: { maxAge: 86400 } },
      { name: 'With SameSite Lax', options: { sameSite: 'lax' as const } },
      { name: 'With SameSite None + Secure', options: { sameSite: 'none' as const, secure: true } },
    ];

    console.group('Cookie Configuration Tests');
    
    configs.forEach(({ name, options }) => {
      try {
        CookieState.set(`${key}_${name.toLowerCase().replace(/\s+/g, '_')}`, value, options);
        const stored = CookieState.get(`${key}_${name.toLowerCase().replace(/\s+/g, '_')}`);
        console.log(`✅ ${name}: Success - Value stored and retrieved`, { options, stored });
      } catch (e: any) {
        console.error(`❌ ${name}: Failed`, { options, error: e.message });
      }
    });
    
    console.log('All cookies:', this.getAllCookies());
    console.groupEnd();
  }
}

// Export for use in production debugging
if (typeof window !== 'undefined') {
  (window as any).CookieDebug = CookieDebug;
}
