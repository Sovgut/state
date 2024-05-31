import { describe, expect, it, vi } from "vitest";
import { LocalState } from "./local";

describe(LocalState.name, () => {
  it("should trigger event when a key is set", () => {
    LocalState.removeAllListeners();
    LocalState.clear();

    const callback = vi.fn();
    LocalState.on("test-key", callback);

    LocalState.set("test-key", "test-value");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "local",
    });
  });

  it("should trigger event once when a key is set with once", () => {
    LocalState.removeAllListeners();
    LocalState.clear();

    const callback = vi.fn();
    LocalState.once("test-key", callback);

    LocalState.set("test-key", "test-value");
    LocalState.set("test-key", "another-value");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "local",
    });
  });

  it("should not trigger event after it is removed", () => {
    LocalState.removeAllListeners();
    LocalState.clear();

    const callback = vi.fn();
    LocalState.on("test-key", callback);
    LocalState.off("test-key", callback);

    LocalState.set("test-key", "test-value");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should trigger event when a key is unset", () => {
    LocalState.removeAllListeners();
    LocalState.clear();

    const callback = vi.fn();
    LocalState.on("test-key", callback);

    LocalState.set("test-key", "test-value");
    LocalState.unset("test-key");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      strategy: "local",
    });
  });

  it("Write and read data", () => {
    LocalState.set("test-1", 1n);
    LocalState.set("test-2", 1);
    LocalState.set("test-3", "foo");
    LocalState.set("test-4", true);
    LocalState.set("test-5", {});
    LocalState.set("test-6", []);

    expect(LocalState.get("test-1")).toBe("1");
    expect(LocalState.get("test-2")).toBe("1");
    expect(LocalState.get("test-3")).toBe("foo");
    expect(LocalState.get("test-4")).toBe("true");
    expect(LocalState.get("test-5")).toBe("{}");
    expect(LocalState.get("test-6")).toBe("[]");
  });

  it("Remove data", () => {
    LocalState.set("test-1", 1n);
    LocalState.set("test-2", 1);
    LocalState.set("test-3", "foo");
    LocalState.set("test-4", true);
    LocalState.set("test-5", {});
    LocalState.set("test-6", []);

    LocalState.unset("test-1");
    LocalState.unset("test-2");
    LocalState.unset("test-3");
    LocalState.unset("test-4");
    LocalState.unset("test-5");
    LocalState.unset("test-6");

    expect(LocalState.get("test-1")).toBe(undefined);
    expect(LocalState.get("test-2")).toBe(undefined);
    expect(LocalState.get("test-3")).toBe(undefined);
    expect(LocalState.get("test-4")).toBe(undefined);
    expect(LocalState.get("test-5")).toBe(undefined);
    expect(LocalState.get("test-6")).toBe(undefined);
  });

  it("Clear data", () => {
    LocalState.set("test-1", 1n);
    LocalState.set("test-2", 1);
    LocalState.set("test-3", "foo");
    LocalState.set("test-4", true);
    LocalState.set("test-5", {});
    LocalState.set("test-6", []);

    LocalState.clear();

    expect(LocalState.get("test-1")).toBe(undefined);
    expect(LocalState.get("test-2")).toBe(undefined);
    expect(LocalState.get("test-3")).toBe(undefined);
    expect(LocalState.get("test-4")).toBe(undefined);
    expect(LocalState.get("test-5")).toBe(undefined);
    expect(LocalState.get("test-6")).toBe(undefined);
  });

  it("Has data", () => {
    LocalState.set("test-1", 1n);
    LocalState.set("test-2", 1);
    LocalState.set("test-3", "foo");
    LocalState.set("test-4", true);
    LocalState.set("test-5", {});
    LocalState.set("test-6", []);

    expect(LocalState.has("test-1")).toBe(true);
    expect(LocalState.has("test-2")).toBe(true);
    expect(LocalState.has("test-3")).toBe(true);
    expect(LocalState.has("test-4")).toBe(true);
    expect(LocalState.has("test-5")).toBe(true);
    expect(LocalState.has("test-6")).toBe(true);
  });

  it("Fallback data", () => {
    expect(LocalState.get("test-1", { fallback: 1n })).toBe(1n);
    expect(LocalState.get("test-2", { fallback: 1 })).toBe(1);
    expect(LocalState.get("test-3", { fallback: "foo" })).toBe("foo");
    expect(LocalState.get("test-4", { fallback: true })).toBe(true);
    expect(LocalState.get("test-5", { fallback: {} })).toStrictEqual({});
    expect(LocalState.get("test-6", { fallback: [] })).toStrictEqual([]);
  });

  it("Cast data", () => {
    LocalState.set("test-1", 1n);
    LocalState.set("test-2", 1);
    LocalState.set("test-3", "foo");
    LocalState.set("test-4", true);
    LocalState.set("test-5", {});
    LocalState.set("test-6", []);

    LocalState.set("test-7", 1n);
    LocalState.set("test-8", 1);
    LocalState.set("test-9", "foo");
    LocalState.set("test-10", true);
    LocalState.set("test-11", {});
    LocalState.set("test-12", []);

    expect(LocalState.get("test-1", { cast: "bigint" })).toBe(1n);
    expect(LocalState.get("test-2", { cast: "number" })).toBe(1);
    expect(LocalState.get("test-3", { cast: "string" })).toBe("foo");
    expect(LocalState.get("test-4", { cast: "boolean" })).toBe(true);
    expect(LocalState.get("test-5", { cast: "object" })).toStrictEqual({});
    expect(LocalState.get("test-6", { cast: "object" })).toStrictEqual([]);

    expect(LocalState.get("test-7", { fallback: 1n })).toBe(1n);
    expect(LocalState.get("test-8", { fallback: 1 })).toBe(1);
    expect(LocalState.get("test-9", { fallback: "foo" })).toBe("foo");
    expect(LocalState.get("test-10", { fallback: true })).toBe(true);
    expect(LocalState.get("test-11", { fallback: {} })).toStrictEqual({});
    expect(LocalState.get("test-12", { fallback: [] })).toStrictEqual([]);
  });
});
