import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CookieState } from './CookieState.ts';
import { StateDoesNotExist } from '~/errors/StateDoesNotExist.ts';
import { StateInvalidCast } from '~/errors/StateInvalidCast.ts';

// Mock document.cookie
let cookieStore: Record<string, string> = {};

Object.defineProperty(document, 'cookie', {
  get() {
    return Object.entries(cookieStore)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  },
  set(value: string) {
    const [cookiePair] = value.split(';');
    const [key, val] = cookiePair.split('=');
    if (val === '' || value.includes('expires=Thu, 01 Jan 1970')) {
      delete cookieStore[key.trim()];
    } else {
      cookieStore[key.trim()] = val;
    }
  },
});

describe('Cookie', () => {
  beforeEach(() => {
    // Clear cookies before each test
    cookieStore = {};
    // Clear any observers
    CookieState.removeAllListeners();
  });

  afterEach(() => {
    // Clean up after each test
    cookieStore = {};
    CookieState.removeAllListeners();
  });

  describe('set', () => {
    it('should set a string value', () => {
      CookieState.set('name', 'John');
      expect(cookieStore.name).toBe(encodeURIComponent('"John"'));
    });

    it('should set an object value', () => {
      const user = { id: 1, name: 'John' };
      CookieState.set('user', user);
      expect(cookieStore.user).toBe(encodeURIComponent(JSON.stringify(user)));
    });

    it('should set a number value', () => {
      CookieState.set('age', 25);
      expect(cookieStore.age).toBe(encodeURIComponent('25'));
    });

    it('should set a boolean value', () => {
      CookieState.set('active', true);
      expect(cookieStore.active).toBe(encodeURIComponent('true'));
    });

    it('should emit an event when setting a value', () => {
      const listener = vi.fn();
      CookieState.on('testKey', listener);

      CookieState.set('testKey', 'testValue');

      expect(listener).toHaveBeenCalledWith('testValue');
    });

    it('should set cookie with expires option (Date)', () => {
      const expires = new Date(Date.now() + 86400000); // 1 day from now
      CookieState.set('temp', 'value', { expires });
      expect(cookieStore.temp).toBe(encodeURIComponent('"value"'));
    });

    it('should set cookie with expires option (number of days)', () => {
      CookieState.set('temp', 'value', { expires: 7 }); // 7 days
      expect(cookieStore.temp).toBe(encodeURIComponent('"value"'));
    });

    it('should encode special characters', () => {
      const specialValue = 'test=value&special';
      CookieState.set('special', specialValue);
      expect(cookieStore.special).toBe(encodeURIComponent('"' + specialValue + '"'));
    });
  });

  describe('get', () => {
    it('should get a string value', () => {
      cookieStore.name = encodeURIComponent('"John"');
      expect(CookieState.get('name')).toBe('John');
    });

    it('should get an object value', () => {
      const user = { id: 1, name: 'John' };
      cookieStore.user = encodeURIComponent(JSON.stringify(user));
      expect(CookieState.get('user')).toEqual(user);
    });

    it('should return undefined for non-existent key', () => {
      expect(CookieState.get('nonExistent')).toBeUndefined();
    });

    it('should decode encoded values', () => {
      const specialValue = 'test=value&special';
      cookieStore.special = encodeURIComponent('"' + specialValue + '"');
      expect(CookieState.get('special')).toBe(specialValue);
    });

    describe('with strict option', () => {
      it('should throw StateDoesNotExist for non-existent key', () => {
        expect(() => CookieState.get('nonExistent', { strict: true }))
          .toThrow(StateDoesNotExist);
      });

      it('should return value for existing key', () => {
        cookieStore.exists = encodeURIComponent('"value"');
        expect(CookieState.get('exists', { strict: true })).toBe('value');
      });
    });

    describe('with fallback option', () => {
      it('should return fallback for non-existent key', () => {
        expect(CookieState.get('nonExistent', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for null value', () => {
        cookieStore.nullValue = encodeURIComponent('null');
        expect(CookieState.get('nullValue', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for empty string', () => {
        cookieStore.empty = encodeURIComponent('""');
        expect(CookieState.get('empty', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for empty array', () => {
        cookieStore.emptyArray = encodeURIComponent('[]');
        expect(CookieState.get('emptyArray', { fallback: ['default'] })).toEqual(['default']);
      });

      it('should return fallback for empty object', () => {
        cookieStore.emptyObject = encodeURIComponent('{}');
        expect(CookieState.get('emptyObject', { fallback: { key: 'value' } }))
          .toEqual({ key: 'value' });
      });

      it('should return actual value for non-empty value', () => {
        cookieStore.value = encodeURIComponent('"actual"');
        expect(CookieState.get('value', { fallback: 'default' })).toBe('actual');
      });
    });

    describe('with cast option', () => {
      it('should cast to string', () => {
        cookieStore.number = '123';
        expect(CookieState.get('number', { cast: 'string' })).toBe('123');
      });

      it('should cast to number', () => {
        cookieStore.string = encodeURIComponent('"123"');
        expect(CookieState.get('string', { cast: 'number' })).toBe(123);
      });

      it('should cast to boolean', () => {
        cookieStore.boolTrue = 'true';
        cookieStore.boolOne = '1';
        cookieStore.boolFalse = 'false';

        expect(CookieState.get('boolTrue', { cast: 'boolean' })).toBe(true);
        expect(CookieState.get('boolOne', { cast: 'boolean' })).toBe(true);
        expect(CookieState.get('boolFalse', { cast: 'boolean' })).toBe(false);
      });

      it('should cast to bigint', () => {
        cookieStore.bigNumber = encodeURIComponent('"9007199254740993"');
        expect(CookieState.get('bigNumber', { cast: 'bigint' })).toBe(9007199254740993n);
      });

      it('should throw StateInvalidCast with strict mode on invalid cast', () => {
        cookieStore.invalid = 'not-a-number';
        expect(() => CookieState.get('invalid', { cast: 'bigint', strict: true }))
          .toThrow(StateInvalidCast);
      });

      it('should return undefined on invalid cast without strict mode', () => {
        cookieStore.invalid = 'not-a-number';
        expect(CookieState.get('invalid', { cast: 'bigint' })).toBeUndefined();
      });

      it('should return fallback on invalid cast with fallback', () => {
        cookieStore.invalid = 'not-a-number';
        expect(CookieState.get('invalid', { cast: 'bigint', fallback: 123n })).toBe(123n);
      });
    });
  });

  describe('remove', () => {
    it('should remove an existing key', () => {
      cookieStore.toRemove = 'value';
      CookieState.remove('toRemove');
      expect(cookieStore.toRemove).toBeUndefined();
    });

    it('should emit null when removing a key', () => {
      const listener = vi.fn();
      CookieState.on('toRemove', listener);

      cookieStore.toRemove = 'value';
      CookieState.remove('toRemove');

      expect(listener).toHaveBeenCalledWith(null);
    });

    it('should handle removing non-existent key', () => {
      expect(() => CookieState.remove('nonExistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all cookies', () => {
      cookieStore.key1 = 'value1';
      cookieStore.key2 = 'value2';
      cookieStore.key3 = 'value3';

      CookieState.clear();

      expect(Object.keys(cookieStore).length).toBe(0);
    });

    it('should emit null for all cleared keys', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      CookieState.on('key1', listener1);
      CookieState.on('key2', listener2);

      cookieStore.key1 = 'value1';
      cookieStore.key2 = 'value2';

      CookieState.clear();

      expect(listener1).toHaveBeenCalledWith(null);
      expect(listener2).toHaveBeenCalledWith(null);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cookieStore.exists = 'value';
      expect(CookieState.has('exists')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(CookieState.has('nonExistent')).toBe(false);
    });
  });

  describe('Observer functionality', () => {
    it('should support on/off event handling', () => {
      const listener = vi.fn();
      CookieState.on('testEvent', listener);

      CookieState.set('testEvent', 'value1');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('value1');

      CookieState.off('testEvent', listener);
      CookieState.set('testEvent', 'value2');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support once event handling', () => {
      const listener = vi.fn();
      CookieState.once('testOnce', listener);

      CookieState.set('testOnce', 'first');
      CookieState.set('testOnce', 'second');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });

    it('should support multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      CookieState.on('multiListener', listener1);
      CookieState.on('multiListener', listener2);

      CookieState.set('multiListener', 'value');

      expect(listener1).toHaveBeenCalledWith('value');
      expect(listener2).toHaveBeenCalledWith('value');
    });

    it('should clear all listeners with removeAllListeners()', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      CookieState.on('event1', listener1);
      CookieState.on('event2', listener2);

      CookieState.removeAllListeners();

      CookieState.set('event1', 'value1');
      CookieState.set('event2', 'value2');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
});
