import { describe, it, expect, vi } from "vitest";
import { MemoryState } from "./memory";

describe(MemoryState.name, () => {
  it("should trigger event when a key is set", () => {
    MemoryState.removeAllListeners();
    MemoryState.clear();

    const callback = vi.fn();
    MemoryState.on("test-key", callback);

    MemoryState.set("test-key", "test-value");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "memory",
    });
  });

  it("should trigger event once when a key is set with once", () => {
    MemoryState.removeAllListeners();
    MemoryState.clear();

    const callback = vi.fn();
    MemoryState.once("test-key", callback);

    MemoryState.set("test-key", "test-value");
    MemoryState.set("test-key", "another-value");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "memory",
    });
  });

  it("should not trigger event after it is removed", () => {
    MemoryState.removeAllListeners();
    MemoryState.clear();

    const callback = vi.fn();
    MemoryState.on("test-key", callback);
    MemoryState.off("test-key", callback);

    MemoryState.set("test-key", "test-value");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should trigger event when a key is unset", () => {
    MemoryState.removeAllListeners();
    MemoryState.clear();

    const callback = vi.fn();
    MemoryState.on("test-key", callback);

    MemoryState.set("test-key", "test-value");
    MemoryState.unset("test-key");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      strategy: "memory",
    });
  });

  it("Write and read data", () => {
    MemoryState.set("test-1", 1n);
    MemoryState.set("test-2", 1);
    MemoryState.set("test-3", "foo");
    MemoryState.set("test-4", true);
    MemoryState.set("test-5", {});
    MemoryState.set("test-6", []);

    expect(MemoryState.get("test-1")).toBe("1");
    expect(MemoryState.get("test-2")).toBe("1");
    expect(MemoryState.get("test-3")).toBe("foo");
    expect(MemoryState.get("test-4")).toBe("true");
    expect(MemoryState.get("test-5")).toBe("{}");
    expect(MemoryState.get("test-6")).toBe("[]");
  });

  it("Remove data", () => {
    MemoryState.set("test-1", 1n);
    MemoryState.set("test-2", 1);
    MemoryState.set("test-3", "foo");
    MemoryState.set("test-4", true);
    MemoryState.set("test-5", {});
    MemoryState.set("test-6", []);

    MemoryState.unset("test-1");
    MemoryState.unset("test-2");
    MemoryState.unset("test-3");
    MemoryState.unset("test-4");
    MemoryState.unset("test-5");
    MemoryState.unset("test-6");

    expect(MemoryState.get("test-1")).toBe(undefined);
    expect(MemoryState.get("test-2")).toBe(undefined);
    expect(MemoryState.get("test-3")).toBe(undefined);
    expect(MemoryState.get("test-4")).toBe(undefined);
    expect(MemoryState.get("test-5")).toBe(undefined);
    expect(MemoryState.get("test-6")).toBe(undefined);
  });

  it("Clear data", () => {
    MemoryState.set("test-1", 1n);
    MemoryState.set("test-2", 1);
    MemoryState.set("test-3", "foo");
    MemoryState.set("test-4", true);
    MemoryState.set("test-5", {});
    MemoryState.set("test-6", []);

    MemoryState.clear();

    expect(MemoryState.get("test-1")).toBe(undefined);
    expect(MemoryState.get("test-2")).toBe(undefined);
    expect(MemoryState.get("test-3")).toBe(undefined);
    expect(MemoryState.get("test-4")).toBe(undefined);
    expect(MemoryState.get("test-5")).toBe(undefined);
    expect(MemoryState.get("test-6")).toBe(undefined);
  });

  it("Has data", () => {
    MemoryState.set("test-1", 1n);
    MemoryState.set("test-2", 1);
    MemoryState.set("test-3", "foo");
    MemoryState.set("test-4", true);
    MemoryState.set("test-5", {});
    MemoryState.set("test-6", []);

    expect(MemoryState.has("test-1")).toBe(true);
    expect(MemoryState.has("test-2")).toBe(true);
    expect(MemoryState.has("test-3")).toBe(true);
    expect(MemoryState.has("test-4")).toBe(true);
    expect(MemoryState.has("test-5")).toBe(true);
    expect(MemoryState.has("test-6")).toBe(true);
  });

  it("Fallback data", () => {
    expect(MemoryState.get("test-1", { fallback: 1n })).toBe(1n);
    expect(MemoryState.get("test-2", { fallback: 1 })).toBe(1);
    expect(MemoryState.get("test-3", { fallback: "foo" })).toBe("foo");
    expect(MemoryState.get("test-4", { fallback: true })).toBe(true);
    expect(MemoryState.get("test-5", { fallback: {} })).toStrictEqual({});
    expect(MemoryState.get("test-6", { fallback: [] })).toStrictEqual([]);
  });

  it("Cast data", () => {
    MemoryState.set("test-1", 1n);
    MemoryState.set("test-2", 1);
    MemoryState.set("test-3", "foo");
    MemoryState.set("test-4", true);
    MemoryState.set("test-5", {});
    MemoryState.set("test-6", []);

    MemoryState.set("test-7", 1n);
    MemoryState.set("test-8", 1);
    MemoryState.set("test-9", "foo");
    MemoryState.set("test-10", true);
    MemoryState.set("test-11", {});
    MemoryState.set("test-12", []);

    expect(MemoryState.get("test-1", { cast: "bigint" })).toBe(1n);
    expect(MemoryState.get("test-2", { cast: "number" })).toBe(1);
    expect(MemoryState.get("test-3", { cast: "string" })).toBe("foo");
    expect(MemoryState.get("test-4", { cast: "boolean" })).toBe(true);
    expect(MemoryState.get("test-5", { cast: "object" })).toStrictEqual({});
    expect(MemoryState.get("test-6", { cast: "object" })).toStrictEqual([]);

    expect(MemoryState.get("test-7", { fallback: 1n })).toBe(1n);
    expect(MemoryState.get("test-8", { fallback: 1 })).toBe(1);
    expect(MemoryState.get("test-9", { fallback: "foo" })).toBe("foo");
    expect(MemoryState.get("test-10", { fallback: true })).toBe(true);
    expect(MemoryState.get("test-11", { fallback: {} })).toStrictEqual({});
    expect(MemoryState.get("test-12", { fallback: [] })).toStrictEqual([]);
  });
});
