import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalState } from './LocalState.ts';
import { StateDoesNotExist } from '~/errors/StateDoesNotExist.ts';
import { StateInvalidCast } from '~/errors/StateInvalidCast.ts';

describe('Local', () => {
  beforeEach(() => {
    localStorage.clear();
    LocalState.removeAllListeners();
  });

  afterEach(() => {
    localStorage.clear();
    LocalState.removeAllListeners();
  });

  describe('set', () => {
    it('should set a string value', () => {
      LocalState.set('name', 'John');
      expect(localStorage.getItem('name')).toBe('John');
    });

    it('should set an object value', () => {
      const user = { id: 1, name: 'John' };
      LocalState.set('user', user);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    });

    it('should set a number value', () => {
      LocalState.set('age', 25);
      expect(localStorage.getItem('age')).toBe('25');
    });

    it('should set a boolean value', () => {
      LocalState.set('active', true);
      expect(localStorage.getItem('active')).toBe('true');
    });

    it('should emit an event when setting a value', () => {
      const listener = vi.fn();
      LocalState.on('testKey', listener);

      LocalState.set('testKey', 'testValue');

      expect(listener).toHaveBeenCalledWith('testValue');
    });
  });

  describe('get', () => {
    it('should get a string value', () => {
      localStorage.setItem('name', 'John');
      expect(LocalState.get('name')).toBe('John');
    });

    it('should get an object value', () => {
      const user = { id: 1, name: 'John' };
      localStorage.setItem('user', JSON.stringify(user));
      expect(LocalState.get('user')).toEqual(user);
    });

    it('should return undefined for non-existent key', () => {
      expect(LocalState.get('nonExistent')).toBeUndefined();
    });

    it('should return raw string if JSON parsing fails', () => {
      localStorage.setItem('invalid', 'not a json');
      expect(LocalState.get('invalid')).toBe('not a json');
    });

    describe('with strict option', () => {
      it('should throw StateDoesNotExist for non-existent key', () => {
        expect(() => LocalState.get('nonExistent', { strict: true }))
          .toThrow(StateDoesNotExist);
      });

      it('should return value for existing key', () => {
        localStorage.setItem('exists', '"value"');
        expect(LocalState.get('exists', { strict: true })).toBe('value');
      });
    });

    describe('with fallback option', () => {
      it('should return fallback for non-existent key', () => {
        expect(LocalState.get('nonExistent', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for null value', () => {
        localStorage.setItem('nullValue', 'null');
        expect(LocalState.get('nullValue', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for empty string', () => {
        localStorage.setItem('empty', '""');
        expect(LocalState.get('empty', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for empty array', () => {
        localStorage.setItem('emptyArray', '[]');
        expect(LocalState.get('emptyArray', { fallback: ['default'] })).toEqual(['default']);
      });

      it('should return fallback for empty object', () => {
        localStorage.setItem('emptyObject', '{}');
        expect(LocalState.get('emptyObject', { fallback: { key: 'value' } }))
          .toEqual({ key: 'value' });
      });

      it('should return actual value for non-empty value', () => {
        localStorage.setItem('value', '"actual"');
        expect(LocalState.get('value', { fallback: 'default' })).toBe('actual');
      });
    });

    describe('with cast option', () => {
      it('should cast to string', () => {
        localStorage.setItem('number', '123');
        expect(LocalState.get('number', { cast: 'string' })).toBe('123');
      });

      it('should cast to number', () => {
        localStorage.setItem('string', '"123"');
        expect(LocalState.get('string', { cast: 'number' })).toBe(123);
      });

      it('should cast to boolean', () => {
        localStorage.setItem('boolTrue', 'true');
        localStorage.setItem('boolOne', '1');
        localStorage.setItem('boolFalse', 'false');

        expect(LocalState.get('boolTrue', { cast: 'boolean' })).toBe(true);
        expect(LocalState.get('boolOne', { cast: 'boolean' })).toBe(true);
        expect(LocalState.get('boolFalse', { cast: 'boolean' })).toBe(false);
      });

      it('should cast to bigint', () => {
        localStorage.setItem('bigNumber', '"9007199254740993"');
        expect(LocalState.get('bigNumber', { cast: 'bigint' })).toBe(9007199254740993n);
      });

      it('should throw StateInvalidCast with strict mode on invalid cast', () => {
        localStorage.setItem('invalid', 'not-a-number');
        expect(() => LocalState.get('invalid', { cast: 'bigint', strict: true }))
          .toThrow(StateInvalidCast);
      });

      it('should return undefined on invalid cast without strict mode', () => {
        localStorage.setItem('invalid', 'not-a-number');
        expect(LocalState.get('invalid', { cast: 'bigint' })).toBeUndefined();
      });

      it('should return fallback on invalid cast with fallback', () => {
        localStorage.setItem('invalid', 'not-a-number');
        expect(LocalState.get('invalid', { cast: 'bigint', fallback: 123n })).toBe(123n);
      });
    });
  });

  describe('remove', () => {
    it('should remove an existing key', () => {
      localStorage.setItem('toRemove', 'value');
      LocalState.remove('toRemove');
      expect(localStorage.getItem('toRemove')).toBeNull();
    });

    it('should emit null when removing a key', () => {
      const listener = vi.fn();
      LocalState.on('toRemove', listener);

      localStorage.setItem('toRemove', 'value');
      LocalState.remove('toRemove');

      expect(listener).toHaveBeenCalledWith(null);
    });

    it('should handle removing non-existent key', () => {
      expect(() => LocalState.remove('nonExistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items from localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      LocalState.clear();

      expect(localStorage.length).toBe(0);
    });

    it('should emit null for all cleared keys', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      LocalState.on('key1', listener1);
      LocalState.on('key2', listener2);

      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      LocalState.clear();

      expect(listener1).toHaveBeenCalledWith(null);
      expect(listener2).toHaveBeenCalledWith(null);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      localStorage.setItem('exists', 'value');
      expect(LocalState.has('exists')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(LocalState.has('nonExistent')).toBe(false);
    });
  });

  describe('Observer functionality', () => {
    it('should support on/off event handling', () => {
      const listener = vi.fn();
      LocalState.on('testEvent', listener);

      LocalState.set('testEvent', 'value1');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('value1');

      LocalState.off('testEvent', listener);
      LocalState.set('testEvent', 'value2');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support once event handling', () => {
      const listener = vi.fn();
      LocalState.once('testOnce', listener);

      LocalState.set('testOnce', 'first');
      LocalState.set('testOnce', 'second');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });

    it('should support multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      LocalState.on('multiListener', listener1);
      LocalState.on('multiListener', listener2);

      LocalState.set('multiListener', 'value');

      expect(listener1).toHaveBeenCalledWith('value');
      expect(listener2).toHaveBeenCalledWith('value');
    });

    it('should clear all listeners with removeAllListeners()', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      LocalState.on('event1', listener1);
      LocalState.on('event2', listener2);

      LocalState.removeAllListeners();

      LocalState.set('event1', 'value1');
      LocalState.set('event2', 'value2');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
});
