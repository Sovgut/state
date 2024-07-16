import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryState } from "./memory";

describe(MemoryState.name, () => {
  beforeEach(() => {
    MemoryState.removeAllListeners();
    MemoryState.clear();
  });

  it("should trigger event when a key is set", () => {
    const callback = vi.fn();
    MemoryState.on("test-key", callback);

    MemoryState.setItem("test-key", "test-value");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "memory",
    });
  });

  it("should trigger event once when a key is set with once", () => {
    const callback = vi.fn();
    MemoryState.once("test-key", callback);

    MemoryState.setItem("test-key", "test-value");
    MemoryState.setItem("test-key", "another-value");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "memory",
    });
  });

  it("should not trigger event after it is removed", () => {
    const callback = vi.fn();
    MemoryState.on("test-key", callback);
    MemoryState.off("test-key", callback);

    MemoryState.setItem("test-key", "test-value");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should trigger event when a key is unset", () => {
    const callback = vi.fn();
    MemoryState.on("test-key", callback);

    MemoryState.setItem("test-key", "test-value");
    MemoryState.removeItem("test-key");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      strategy: "memory",
    });
  });

  it("Write and read data", () => {
    MemoryState.setItem("test-1", 1n);
    MemoryState.setItem("test-2", 1);
    MemoryState.setItem("test-3", "foo");
    MemoryState.setItem("test-4", true);
    MemoryState.setItem("test-5", {});
    MemoryState.setItem("test-6", []);

    expect(MemoryState.getItem("test-1")).toBe("1");
    expect(MemoryState.getItem("test-2")).toBe("1");
    expect(MemoryState.getItem("test-3")).toBe("foo");
    expect(MemoryState.getItem("test-4")).toBe("true");
    expect(MemoryState.getItem("test-5")).toBe("{}");
    expect(MemoryState.getItem("test-6")).toBe("[]");
  });

  it("Remove data", () => {
    MemoryState.setItem("test-1", 1n);
    MemoryState.setItem("test-2", 1);
    MemoryState.setItem("test-3", "foo");
    MemoryState.setItem("test-4", true);
    MemoryState.setItem("test-5", {});
    MemoryState.setItem("test-6", []);

    MemoryState.removeItem("test-1");
    MemoryState.removeItem("test-2");
    MemoryState.removeItem("test-3");
    MemoryState.removeItem("test-4");
    MemoryState.removeItem("test-5");
    MemoryState.removeItem("test-6");

    expect(MemoryState.getItem("test-1")).toBe(undefined);
    expect(MemoryState.getItem("test-2")).toBe(undefined);
    expect(MemoryState.getItem("test-3")).toBe(undefined);
    expect(MemoryState.getItem("test-4")).toBe(undefined);
    expect(MemoryState.getItem("test-5")).toBe(undefined);
    expect(MemoryState.getItem("test-6")).toBe(undefined);
  });

  it("Clear data", () => {
    MemoryState.setItem("test-1", 1n);
    MemoryState.setItem("test-2", 1);
    MemoryState.setItem("test-3", "foo");
    MemoryState.setItem("test-4", true);
    MemoryState.setItem("test-5", {});
    MemoryState.setItem("test-6", []);

    MemoryState.clear();

    expect(MemoryState.getItem("test-1")).toBe(undefined);
    expect(MemoryState.getItem("test-2")).toBe(undefined);
    expect(MemoryState.getItem("test-3")).toBe(undefined);
    expect(MemoryState.getItem("test-4")).toBe(undefined);
    expect(MemoryState.getItem("test-5")).toBe(undefined);
    expect(MemoryState.getItem("test-6")).toBe(undefined);
  });

  it("Has data", () => {
    MemoryState.setItem("test-1", 1n);
    MemoryState.setItem("test-2", 1);
    MemoryState.setItem("test-3", "foo");
    MemoryState.setItem("test-4", true);
    MemoryState.setItem("test-5", {});
    MemoryState.setItem("test-6", []);

    expect(MemoryState.has("test-1")).toBe(true);
    expect(MemoryState.has("test-2")).toBe(true);
    expect(MemoryState.has("test-3")).toBe(true);
    expect(MemoryState.has("test-4")).toBe(true);
    expect(MemoryState.has("test-5")).toBe(true);
    expect(MemoryState.has("test-6")).toBe(true);
  });

  it("Fallback data", () => {
    expect(MemoryState.getItem("test-1", { fallback: 1n })).toBe(1n);
    expect(MemoryState.getItem("test-2", { fallback: 1 })).toBe(1);
    expect(MemoryState.getItem("test-3", { fallback: "foo" })).toBe("foo");
    expect(MemoryState.getItem("test-4", { fallback: true })).toBe(true);
    expect(MemoryState.getItem("test-5", { fallback: {} })).toStrictEqual({});
    expect(MemoryState.getItem("test-6", { fallback: [] })).toStrictEqual([]);
  });

  it("Cast data", () => {
    MemoryState.setItem("test-1", 1n);
    MemoryState.setItem("test-2", 1);
    MemoryState.setItem("test-3", "foo");
    MemoryState.setItem("test-4", true);
    MemoryState.setItem("test-5", {});
    MemoryState.setItem("test-6", []);

    MemoryState.setItem("test-7", 1n);
    MemoryState.setItem("test-8", 1);
    MemoryState.setItem("test-9", "foo");
    MemoryState.setItem("test-10", true);
    MemoryState.setItem("test-11", {});
    MemoryState.setItem("test-12", []);

    expect(MemoryState.getItem("test-1", { cast: "bigint" })).toBe(1n);
    expect(MemoryState.getItem("test-2", { cast: "number" })).toBe(1);
    expect(MemoryState.getItem("test-3", { cast: "string" })).toBe("foo");
    expect(MemoryState.getItem("test-4", { cast: "boolean" })).toBe(true);
    expect(MemoryState.getItem("test-5", { cast: "object" })).toStrictEqual({});
    expect(MemoryState.getItem("test-6", { cast: "object" })).toStrictEqual([]);

    expect(MemoryState.getItem("test-7", { fallback: 1n })).toBe(1n);
    expect(MemoryState.getItem("test-8", { fallback: 1 })).toBe(1);
    expect(MemoryState.getItem("test-9", { fallback: "foo" })).toBe("foo");
    expect(MemoryState.getItem("test-10", { fallback: true })).toBe(true);
    expect(MemoryState.getItem("test-11", { fallback: {} })).toStrictEqual({});
    expect(MemoryState.getItem("test-12", { fallback: [] })).toStrictEqual([]);
  });
});
