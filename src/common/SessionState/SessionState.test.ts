import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionState } from './SessionState.ts';
import { StateDoesNotExist } from '~/errors/StateDoesNotExist.ts';
import { StateInvalidCast } from '~/errors/StateInvalidCast.ts';

describe('Session', () => {
  beforeEach(() => {
    sessionStorage.clear();
    SessionState.removeAllListeners();
  });

  afterEach(() => {
    sessionStorage.clear();
    SessionState.removeAllListeners();
  });

  describe('set', () => {
    it('should set a string value', () => {
      SessionState.set('name', 'John');
      expect(sessionStorage.getItem('name')).toBe('John');
    });

    it('should set an object value', () => {
      const user = { id: 1, name: 'John' };
      SessionState.set('user', user);
      expect(sessionStorage.getItem('user')).toBe(JSON.stringify(user));
    });

    it('should set a number value', () => {
      SessionState.set('age', 25);
      expect(sessionStorage.getItem('age')).toBe('25');
    });

    it('should set a boolean value', () => {
      SessionState.set('active', true);
      expect(sessionStorage.getItem('active')).toBe('true');
    });

    it('should emit an event when setting a value', () => {
      const listener = vi.fn();
      SessionState.on('testKey', listener);

      SessionState.set('testKey', 'testValue');

      expect(listener).toHaveBeenCalledWith('testValue');
    });
  });

  describe('get', () => {
    it('should get a string value', () => {
      sessionStorage.setItem('name', 'John');
      expect(SessionState.get('name')).toBe('John');
    });

    it('should get an object value', () => {
      const user = { id: 1, name: 'John' };
      sessionStorage.setItem('user', JSON.stringify(user));
      expect(SessionState.get('user')).toEqual(user);
    });

    it('should return undefined for non-existent key', () => {
      expect(SessionState.get('nonExistent')).toBeUndefined();
    });

    it('should return raw string if JSON parsing fails', () => {
      sessionStorage.setItem('invalid', 'not a json');
      expect(SessionState.get('invalid')).toBe('not a json');
    });

    describe('with strict option', () => {
      it('should throw StateDoesNotExist for non-existent key', () => {
        expect(() => SessionState.get('nonExistent', { strict: true }))
          .toThrow(StateDoesNotExist);
      });

      it('should return value for existing key', () => {
        sessionStorage.setItem('exists', '"value"');
        expect(SessionState.get('exists', { strict: true })).toBe('value');
      });
    });

    describe('with fallback option', () => {
      it('should return fallback for non-existent key', () => {
        expect(SessionState.get('nonExistent', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for null value', () => {
        sessionStorage.setItem('nullValue', 'null');
        expect(SessionState.get('nullValue', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for empty string', () => {
        sessionStorage.setItem('empty', '""');
        expect(SessionState.get('empty', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for empty array', () => {
        sessionStorage.setItem('emptyArray', '[]');
        expect(SessionState.get('emptyArray', { fallback: ['default'] })).toEqual(['default']);
      });

      it('should return fallback for empty object', () => {
        sessionStorage.setItem('emptyObject', '{}');
        expect(SessionState.get('emptyObject', { fallback: { key: 'value' } }))
          .toEqual({ key: 'value' });
      });

      it('should return actual value for non-empty value', () => {
        sessionStorage.setItem('value', '"actual"');
        expect(SessionState.get('value', { fallback: 'default' })).toBe('actual');
      });
    });

    describe('with cast option', () => {
      it('should cast to string', () => {
        sessionStorage.setItem('number', '123');
        expect(SessionState.get('number', { cast: 'string' })).toBe('123');
      });

      it('should cast to number', () => {
        sessionStorage.setItem('string', '"123"');
        expect(SessionState.get('string', { cast: 'number' })).toBe(123);
      });

      it('should cast to boolean', () => {
        sessionStorage.setItem('boolTrue', 'true');
        sessionStorage.setItem('boolOne', '1');
        sessionStorage.setItem('boolFalse', 'false');

        expect(SessionState.get('boolTrue', { cast: 'boolean' })).toBe(true);
        expect(SessionState.get('boolOne', { cast: 'boolean' })).toBe(true);
        expect(SessionState.get('boolFalse', { cast: 'boolean' })).toBe(false);
      });

      it('should cast to bigint', () => {
        sessionStorage.setItem('bigNumber', '"9007199254740993"');
        expect(SessionState.get('bigNumber', { cast: 'bigint' })).toBe(9007199254740993n);
      });

      it('should throw StateInvalidCast with strict mode on invalid cast', () => {
        sessionStorage.setItem('invalid', 'not-a-number');
        expect(() => SessionState.get('invalid', { cast: 'bigint', strict: true }))
          .toThrow(StateInvalidCast);
      });

      it('should return undefined on invalid cast without strict mode', () => {
        sessionStorage.setItem('invalid', 'not-a-number');
        expect(SessionState.get('invalid', { cast: 'bigint' })).toBeUndefined();
      });

      it('should return fallback on invalid cast with fallback', () => {
        sessionStorage.setItem('invalid', 'not-a-number');
        expect(SessionState.get('invalid', { cast: 'bigint', fallback: 123n })).toBe(123n);
      });
    });
  });

  describe('remove', () => {
    it('should remove an existing key', () => {
      sessionStorage.setItem('toRemove', 'value');
      SessionState.remove('toRemove');
      expect(sessionStorage.getItem('toRemove')).toBeNull();
    });

    it('should emit null when removing a key', () => {
      const listener = vi.fn();
      SessionState.on('toRemove', listener);

      sessionStorage.setItem('toRemove', 'value');
      SessionState.remove('toRemove');

      expect(listener).toHaveBeenCalledWith(null);
    });

    it('should handle removing non-existent key', () => {
      expect(() => SessionState.remove('nonExistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items from sessionStorage', () => {
      sessionStorage.setItem('key1', 'value1');
      sessionStorage.setItem('key2', 'value2');
      sessionStorage.setItem('key3', 'value3');

      SessionState.clear();

      expect(sessionStorage.length).toBe(0);
    });

    it('should emit null for all cleared keys', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      SessionState.on('key1', listener1);
      SessionState.on('key2', listener2);

      sessionStorage.setItem('key1', 'value1');
      sessionStorage.setItem('key2', 'value2');

      SessionState.clear();

      expect(listener1).toHaveBeenCalledWith(null);
      expect(listener2).toHaveBeenCalledWith(null);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      sessionStorage.setItem('exists', 'value');
      expect(SessionState.has('exists')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(SessionState.has('nonExistent')).toBe(false);
    });
  });

  describe('Observer functionality', () => {
    it('should support on/off event handling', () => {
      const listener = vi.fn();
      SessionState.on('testEvent', listener);

      SessionState.set('testEvent', 'value1');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('value1');

      SessionState.off('testEvent', listener);
      SessionState.set('testEvent', 'value2');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support once event handling', () => {
      const listener = vi.fn();
      SessionState.once('testOnce', listener);

      SessionState.set('testOnce', 'first');
      SessionState.set('testOnce', 'second');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });

    it('should support multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      SessionState.on('multiListener', listener1);
      SessionState.on('multiListener', listener2);

      SessionState.set('multiListener', 'value');

      expect(listener1).toHaveBeenCalledWith('value');
      expect(listener2).toHaveBeenCalledWith('value');
    });

    it('should clear all listeners with off()', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      SessionState.on('event1', listener1);
      SessionState.on('event2', listener2);

      SessionState.removeAllListeners();

      SessionState.set('event1', 'value1');
      SessionState.set('event2', 'value2');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
});
