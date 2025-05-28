import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryState } from './MemoryState.ts';
import { StateDoesNotExist } from '~/errors/StateDoesNotExist.ts';
import { StateInvalidCast } from '~/errors/StateInvalidCast.ts';

describe('Memory', () => {
  beforeEach(() => {
    MemoryState.clear();
    MemoryState.removeAllListeners();
  });

  afterEach(() => {
    MemoryState.clear();
    MemoryState.removeAllListeners();
  });

  describe('set', () => {
    it('should set a string value', () => {
      MemoryState.set('name', 'John');
      expect(MemoryState.get('name')).toBe('John');
    });

    it('should set an object value', () => {
      const user = { id: 1, name: 'John' };
      MemoryState.set('user', user);
      expect(MemoryState.get('user')).toEqual(user);
    });

    it('should set a number value', () => {
      MemoryState.set('age', 25);
      expect(MemoryState.get('age')).toBe(25);
    });

    it('should set a boolean value', () => {
      MemoryState.set('active', true);
      expect(MemoryState.get('active')).toBe(true);
    });

    it('should emit an event when setting a value', () => {
      const listener = vi.fn();
      MemoryState.on('testKey', listener);

      MemoryState.set('testKey', 'testValue');

      expect(listener).toHaveBeenCalledWith('testValue');
    });
  });

  describe('get', () => {
    it('should get a string value', () => {
      MemoryState.set('name', 'John');
      expect(MemoryState.get('name')).toBe('John');
    });

    it('should get an object value', () => {
      const user = { id: 1, name: 'John' };
      MemoryState.set('user', user);
      expect(MemoryState.get('user')).toBe(user);
    });

    it('should return undefined for non-existent key', () => {
      expect(MemoryState.get('nonExistent')).toBeUndefined();
    });

    describe('with strict option', () => {
      it('should throw StateDoesNotExist for non-existent key', () => {
        expect(() => MemoryState.get('nonExistent', { strict: true }))
          .toThrow(StateDoesNotExist);
      });

      it('should return value for existing key', () => {
        MemoryState.set('exists', 'value');
        expect(MemoryState.get('exists', { strict: true })).toBe('value');
      });
    });

    describe('with fallback option', () => {
      it('should return fallback for non-existent key', () => {
        expect(MemoryState.get('nonExistent', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for null value', () => {
        MemoryState.set('nullValue', null);
        expect(MemoryState.get('nullValue', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for empty string', () => {
        MemoryState.set('empty', '');
        expect(MemoryState.get('empty', { fallback: 'default' })).toBe('default');
      });

      it('should return fallback for empty array', () => {
        MemoryState.set('emptyArray', []);
        expect(MemoryState.get('emptyArray', { fallback: ['default'] })).toEqual(['default']);
      });

      it('should return fallback for empty object', () => {
        MemoryState.set('emptyObject', {});
        expect(MemoryState.get('emptyObject', { fallback: { key: 'value' } }))
          .toEqual({ key: 'value' });
      });

      it('should return actual value for non-empty value', () => {
        MemoryState.set('value', 'actual');
        expect(MemoryState.get('value', { fallback: 'default' })).toBe('actual');
      });
    });

    describe('with cast option', () => {
      it('should cast to string', () => {
        MemoryState.set('number', 123);
        expect(MemoryState.get('number', { cast: 'string' })).toBe('123');
      });

      it('should cast to number', () => {
        MemoryState.set('string', '123');
        expect(MemoryState.get('string', { cast: 'number' })).toBe(123);
      });

      it('should cast to boolean', () => {
        MemoryState.set('truthy', 1);
        MemoryState.set('falsy', 0);
        MemoryState.set('empty', '');

        expect(MemoryState.get('truthy', { cast: 'boolean' })).toBe(true);
        expect(MemoryState.get('falsy', { cast: 'boolean' })).toBe(false);
        expect(MemoryState.get('empty', { cast: 'boolean' })).toBe(false);
      });

      it('should cast to bigint', () => {
        MemoryState.set('bigNumber', '9007199254740993');
        expect(MemoryState.get('bigNumber', { cast: 'bigint' })).toBe(9007199254740993n);
      });

      it('should throw StateInvalidCast with strict mode on invalid cast', () => {
        MemoryState.set('invalid', { obj: 'value' });
        expect(() => MemoryState.get('invalid', { cast: 'bigint', strict: true }))
          .toThrow(StateInvalidCast);
      });

      it('should return undefined on invalid cast without strict mode', () => {
        MemoryState.set('invalid', { obj: 'value' });
        expect(MemoryState.get('invalid', { cast: 'bigint' })).toBeUndefined();
      });

      it('should return fallback on invalid cast with fallback', () => {
        MemoryState.set('invalid', { obj: 'value' });
        expect(MemoryState.get('invalid', { cast: 'bigint', fallback: 123n })).toBe(123n);
      });
    });
  });

  describe('remove', () => {
    it('should remove an existing key', () => {
      MemoryState.set('toRemove', 'value');
      MemoryState.remove('toRemove');
      expect(MemoryState.has('toRemove')).toBe(false);
    });

    it('should emit null when removing a key', () => {
      const listener = vi.fn();
      MemoryState.on('toRemove', listener);

      MemoryState.set('toRemove', 'value');
      MemoryState.remove('toRemove');

      expect(listener).toHaveBeenCalledWith(null);
    });

    it('should handle removing non-existent key', () => {
      expect(() => MemoryState.remove('nonExistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items from memory', () => {
      MemoryState.set('key1', 'value1');
      MemoryState.set('key2', 'value2');
      MemoryState.set('key3', 'value3');

      MemoryState.clear();

      expect(MemoryState.has('key1')).toBe(false);
      expect(MemoryState.has('key2')).toBe(false);
      expect(MemoryState.has('key3')).toBe(false);
    });

    it('should emit null for all cleared keys', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      MemoryState.on('key1', listener1);
      MemoryState.on('key2', listener2);

      MemoryState.set('key1', 'value1');
      MemoryState.set('key2', 'value2');

      MemoryState.clear();

      expect(listener1).toHaveBeenCalledWith(null);
      expect(listener2).toHaveBeenCalledWith(null);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      MemoryState.set('exists', 'value');
      expect(MemoryState.has('exists')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(MemoryState.has('nonExistent')).toBe(false);
    });
  });

  describe('Observer functionality', () => {
    it('should support on/off event handling', () => {
      const listener = vi.fn();
      MemoryState.on('testEvent', listener);

      MemoryState.set('testEvent', 'value1');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('value1');

      MemoryState.off('testEvent', listener);
      MemoryState.set('testEvent', 'value2');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support once event handling', () => {
      const listener = vi.fn();
      MemoryState.once('testOnce', listener);

      MemoryState.set('testOnce', 'first');
      MemoryState.set('testOnce', 'second');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });

    it('should support multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      MemoryState.on('multiListener', listener1);
      MemoryState.on('multiListener', listener2);

      MemoryState.set('multiListener', 'value');

      expect(listener1).toHaveBeenCalledWith('value');
      expect(listener2).toHaveBeenCalledWith('value');
    });

    it('should clear all listeners with removeAllListeners()', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      MemoryState.on('event1', listener1);
      MemoryState.on('event2', listener2);

      MemoryState.removeAllListeners();

      MemoryState.set('event1', 'value1');
      MemoryState.set('event2', 'value2');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
});
