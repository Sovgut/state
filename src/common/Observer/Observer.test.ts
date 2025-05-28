import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Observer } from './Observer.ts';
import type { Callback } from './Observer.ts';

describe('Observer', () => {
    beforeEach(() => {
        Observer.removeAllListeners();
    });

    afterEach(() => {
        Observer.removeAllListeners();
    });

    describe('on', () => {
        it('should register an event listener', () => {
            const callback = vi.fn();
            Observer.on('test', callback);

            expect(Observer.listenerCount('test')).toBe(1);
        });

        it('should call registered listener when event is emitted', () => {
            const callback: Callback<string> = vi.fn();
            Observer.on('test', callback);

            Observer.emit('test', 'data');

            expect(callback).toHaveBeenCalledWith('data');
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should register multiple listeners for the same event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            Observer.on('test', callback1);
            Observer.on('test', callback2);

            expect(Observer.listenerCount('test')).toBe(2);

            Observer.emit('test', 'data');

            expect(callback1).toHaveBeenCalledWith('data');
            expect(callback2).toHaveBeenCalledWith('data');
        });

        it('should handle typed payloads', () => {
            interface User {
                id: number;
                name: string;
            }

            const callback: Callback<User> = vi.fn();
            Observer.on<User>('user', callback);

            const userData: User = { id: 1, name: 'John' };
            Observer.emit('user', userData);

            expect(callback).toHaveBeenCalledWith(userData);
        });

        it('should handle null payloads', () => {
            const callback: Callback = vi.fn();
            Observer.on('test', callback);

            Observer.emit('test', null);

            expect(callback).toHaveBeenCalledWith(null);
        });
    });

    describe('once', () => {
        it('should register a one-time event listener', () => {
            const callback = vi.fn();
            Observer.once('test', callback);

            Observer.emit('test', 'first');
            Observer.emit('test', 'second');

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('first');
        });

        it('should remove listener after first emit', () => {
            const callback = vi.fn();
            Observer.once('test', callback);

            expect(Observer.listenerCount('test')).toBe(1);

            Observer.emit('test', 'data');

            expect(Observer.listenerCount('test')).toBe(0);
        });

        it('should work with multiple once listeners', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            Observer.once('test', callback1);
            Observer.once('test', callback2);

            Observer.emit('test', 'data');

            expect(callback1).toHaveBeenCalledWith('data');
            expect(callback2).toHaveBeenCalledWith('data');
            expect(Observer.listenerCount('test')).toBe(0);
        });
    });

    describe('off', () => {
        it('should remove a specific event listener', () => {
            const callback = vi.fn();
            Observer.on('test', callback);

            expect(Observer.listenerCount('test')).toBe(1);

            Observer.off('test', callback);

            expect(Observer.listenerCount('test')).toBe(0);
        });

        it('should not call removed listener when event is emitted', () => {
            const callback = vi.fn();
            Observer.on('test', callback);
            Observer.off('test', callback);

            Observer.emit('test', 'data');

            expect(callback).not.toHaveBeenCalled();
        });

        it('should only remove the specified listener', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            Observer.on('test', callback1);
            Observer.on('test', callback2);

            Observer.off('test', callback1);

            expect(Observer.listenerCount('test')).toBe(1);

            Observer.emit('test', 'data');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalledWith('data');
        });

        it('should handle removing non-existent listener gracefully', () => {
            const callback = vi.fn();

            expect(() => Observer.off('test', callback)).not.toThrow();
        });
    });

    describe('removeAllListeners', () => {
        it('should remove all listeners for all events', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const callback3 = vi.fn();

            Observer.on('test1', callback1);
            Observer.on('test2', callback2);
            Observer.on('test3', callback3);

            Observer.removeAllListeners();

            expect(Observer.listenerCount('test1')).toBe(0);
            expect(Observer.listenerCount('test2')).toBe(0);
            expect(Observer.listenerCount('test3')).toBe(0);
        });

        it('should not call any listener after removeAllListeners', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            Observer.on('test1', callback1);
            Observer.on('test2', callback2);

            Observer.removeAllListeners();

            Observer.emit('test1', 'data');
            Observer.emit('test2', 'data');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });
    });

    describe('listenerCount', () => {
        it('should return 0 for events with no listeners', () => {
            expect(Observer.listenerCount('nonexistent')).toBe(0);
        });

        it('should return correct count for events with listeners', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const callback3 = vi.fn();

            Observer.on('test', callback1);
            Observer.on('test', callback2);
            Observer.once('test', callback3);

            expect(Observer.listenerCount('test')).toBe(3);
        });

        it('should update count when listeners are removed', () => {
            const callback = vi.fn();

            Observer.on('test', callback);
            expect(Observer.listenerCount('test')).toBe(1);

            Observer.off('test', callback);
            expect(Observer.listenerCount('test')).toBe(0);
        });
    });

    describe('removeListener', () => {
        it('should remove all listeners for a specific event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            Observer.on('test', callback1);
            Observer.on('test', callback2);

            Observer.removeListener('test');

            expect(Observer.listenerCount('test')).toBe(0);
        });

        it('should not affect listeners for other events', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            Observer.on('test1', callback1);
            Observer.on('test2', callback2);

            Observer.removeListener('test1');

            expect(Observer.listenerCount('test1')).toBe(0);
            expect(Observer.listenerCount('test2')).toBe(1);
        });
    });

    describe('eventNames', () => {
        it('should return empty array when no events are registered', () => {
            expect(Observer.eventNames()).toEqual([]);
        });

        it('should return array of registered event names', () => {
            Observer.on('event1', vi.fn());
            Observer.on('event2', vi.fn());
            Observer.on('event3', vi.fn());

            const eventNames = Observer.eventNames();

            expect(eventNames).toContain('event1');
            expect(eventNames).toContain('event2');
            expect(eventNames).toContain('event3');
            expect(eventNames).toHaveLength(3);
        });

        it('should not include duplicate event names', () => {
            Observer.on('test', vi.fn());
            Observer.on('test', vi.fn());
            Observer.on('test', vi.fn());

            const eventNames = Observer.eventNames();

            expect(eventNames).toEqual(['test']);
        });

        it('should update when events are removed', () => {
            Observer.on('test1', vi.fn());
            Observer.on('test2', vi.fn());

            Observer.removeListener('test1');

            const eventNames = Observer.eventNames();

            expect(eventNames).toEqual(['test2']);
        });
    });

    describe('emit', () => {
        it('should emit events with various data types', () => {
            const stringCallback = vi.fn();
            const numberCallback = vi.fn();
            const objectCallback = vi.fn();
            const arrayCallback = vi.fn();
            const booleanCallback = vi.fn();

            Observer.on('string', stringCallback);
            Observer.on('number', numberCallback);
            Observer.on('object', objectCallback);
            Observer.on('array', arrayCallback);
            Observer.on('boolean', booleanCallback);

            Observer.emit('string', 'test');
            Observer.emit('number', 42);
            Observer.emit('object', { key: 'value' });
            Observer.emit('array', [1, 2, 3]);
            Observer.emit('boolean', true);

            expect(stringCallback).toHaveBeenCalledWith('test');
            expect(numberCallback).toHaveBeenCalledWith(42);
            expect(objectCallback).toHaveBeenCalledWith({ key: 'value' });
            expect(arrayCallback).toHaveBeenCalledWith([1, 2, 3]);
            expect(booleanCallback).toHaveBeenCalledWith(true);
        });

        it('should not throw when emitting event with no listeners', () => {
            expect(() => Observer.emit('nonexistent', 'data')).not.toThrow();
        });

        it('should call listeners in the order they were registered', () => {
            const order: number[] = [];

            Observer.on('test', () => order.push(1));
            Observer.on('test', () => order.push(2));
            Observer.on('test', () => order.push(3));

            Observer.emit('test', null);

            expect(order).toEqual([1, 2, 3]);
        });
    });

    describe('inheritance', () => {
        it('should allow classes to extend Observer', () => {
            class CustomObserver extends Observer {
                static customMethod() {
                    return 'custom';
                }
            }

            expect(CustomObserver.customMethod()).toBe('custom');

            const callback = vi.fn();
            CustomObserver.on('test', callback);
            CustomObserver.emit('test', 'data');

            expect(callback).toHaveBeenCalledWith('data');
        });
    });
});
