import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalState } from "./local";

describe(LocalState.name, () => {
  beforeEach(() => {
    LocalState.removeAllListeners();
    LocalState.clear();
  });

  it("should trigger event when a key is set", () => {
    const callback = vi.fn();
    LocalState.on("test-key", callback);

    LocalState.setItem("test-key", "test-value");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "local",
    });
  });

  it("should trigger event once when a key is set with once", () => {
    const callback = vi.fn();
    LocalState.once("test-key", callback);

    LocalState.setItem("test-key", "test-value");
    LocalState.setItem("test-key", "another-value");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "local",
    });
  });

  it("should not trigger event after it is removed", () => {
    const callback = vi.fn();
    LocalState.on("test-key", callback);
    LocalState.off("test-key", callback);

    LocalState.setItem("test-key", "test-value");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should trigger event when a key is unset", () => {
    const callback = vi.fn();
    LocalState.on("test-key", callback);

    LocalState.setItem("test-key", "test-value");
    LocalState.removeItem("test-key");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      strategy: "local",
    });
  });

  it("Write and read data", () => {
    LocalState.setItem("test-1", 1n);
    LocalState.setItem("test-2", 1);
    LocalState.setItem("test-3", "foo");
    LocalState.setItem("test-4", true);
    LocalState.setItem("test-5", {});
    LocalState.setItem("test-6", []);

    expect(LocalState.getItem("test-1")).toBe("1");
    expect(LocalState.getItem("test-2")).toBe("1");
    expect(LocalState.getItem("test-3")).toBe("foo");
    expect(LocalState.getItem("test-4")).toBe("true");
    expect(LocalState.getItem("test-5")).toBe("{}");
    expect(LocalState.getItem("test-6")).toBe("[]");
  });

  it("Remove data", () => {
    LocalState.setItem("test-1", 1n);
    LocalState.setItem("test-2", 1);
    LocalState.setItem("test-3", "foo");
    LocalState.setItem("test-4", true);
    LocalState.setItem("test-5", {});
    LocalState.setItem("test-6", []);

    LocalState.removeItem("test-1");
    LocalState.removeItem("test-2");
    LocalState.removeItem("test-3");
    LocalState.removeItem("test-4");
    LocalState.removeItem("test-5");
    LocalState.removeItem("test-6");

    expect(LocalState.getItem("test-1")).toBe(undefined);
    expect(LocalState.getItem("test-2")).toBe(undefined);
    expect(LocalState.getItem("test-3")).toBe(undefined);
    expect(LocalState.getItem("test-4")).toBe(undefined);
    expect(LocalState.getItem("test-5")).toBe(undefined);
    expect(LocalState.getItem("test-6")).toBe(undefined);
  });

  it("Clear data", () => {
    LocalState.setItem("test-1", 1n);
    LocalState.setItem("test-2", 1);
    LocalState.setItem("test-3", "foo");
    LocalState.setItem("test-4", true);
    LocalState.setItem("test-5", {});
    LocalState.setItem("test-6", []);

    LocalState.clear();

    expect(LocalState.getItem("test-1")).toBe(undefined);
    expect(LocalState.getItem("test-2")).toBe(undefined);
    expect(LocalState.getItem("test-3")).toBe(undefined);
    expect(LocalState.getItem("test-4")).toBe(undefined);
    expect(LocalState.getItem("test-5")).toBe(undefined);
    expect(LocalState.getItem("test-6")).toBe(undefined);
  });

  it("Has data", () => {
    LocalState.setItem("test-1", 1n);
    LocalState.setItem("test-2", 1);
    LocalState.setItem("test-3", "foo");
    LocalState.setItem("test-4", true);
    LocalState.setItem("test-5", {});
    LocalState.setItem("test-6", []);

    expect(LocalState.has("test-1")).toBe(true);
    expect(LocalState.has("test-2")).toBe(true);
    expect(LocalState.has("test-3")).toBe(true);
    expect(LocalState.has("test-4")).toBe(true);
    expect(LocalState.has("test-5")).toBe(true);
    expect(LocalState.has("test-6")).toBe(true);
  });

  it("Fallback data", () => {
    expect(LocalState.getItem("test-1", { fallback: 1n })).toBe(1n);
    expect(LocalState.getItem("test-2", { fallback: 1 })).toBe(1);
    expect(LocalState.getItem("test-3", { fallback: "foo" })).toBe("foo");
    expect(LocalState.getItem("test-4", { fallback: true })).toBe(true);
    expect(LocalState.getItem("test-5", { fallback: {} })).toStrictEqual({});
    expect(LocalState.getItem("test-6", { fallback: [] })).toStrictEqual([]);
  });

  it("Cast data", () => {
    LocalState.setItem("test-1", 1n);
    LocalState.setItem("test-2", 1);
    LocalState.setItem("test-3", "foo");
    LocalState.setItem("test-4", true);
    LocalState.setItem("test-5", {});
    LocalState.setItem("test-6", []);

    LocalState.setItem("test-7", 1n);
    LocalState.setItem("test-8", 1);
    LocalState.setItem("test-9", "foo");
    LocalState.setItem("test-10", true);
    LocalState.setItem("test-11", {});
    LocalState.setItem("test-12", []);

    expect(LocalState.getItem("test-1", { cast: "bigint" })).toBe(1n);
    expect(LocalState.getItem("test-2", { cast: "number" })).toBe(1);
    expect(LocalState.getItem("test-3", { cast: "string" })).toBe("foo");
    expect(LocalState.getItem("test-4", { cast: "boolean" })).toBe(true);
    expect(LocalState.getItem("test-5", { cast: "object" })).toStrictEqual({});
    expect(LocalState.getItem("test-6", { cast: "object" })).toStrictEqual([]);

    expect(LocalState.getItem("test-7", { fallback: 1n })).toBe(1n);
    expect(LocalState.getItem("test-8", { fallback: 1 })).toBe(1);
    expect(LocalState.getItem("test-9", { fallback: "foo" })).toBe("foo");
    expect(LocalState.getItem("test-10", { fallback: true })).toBe(true);
    expect(LocalState.getItem("test-11", { fallback: {} })).toStrictEqual({});
    expect(LocalState.getItem("test-12", { fallback: [] })).toStrictEqual([]);
  });

  it("use fallback data if value contains `undefined`, `null` or `NaN`", () => {
    LocalState.setItem("test-1", "undefined");
    LocalState.setItem("test-2", "null");
    LocalState.setItem("test-3", "NaN");
    LocalState.setItem("test-4", "bigint");
    LocalState.setItem("test-5", "string");

    expect(LocalState.getItem("test-1")).toBe(undefined);
    expect(LocalState.getItem("test-2")).toBe(undefined);
    expect(LocalState.getItem("test-3")).toBe(undefined);
    expect(LocalState.getItem("test-4")).toBe("bigint");
    expect(LocalState.getItem("test-5")).toBe("string");

    expect(LocalState.getItem("test-1", { fallback: 1n })).toBe(1n);
    expect(LocalState.getItem("test-2", { fallback: 1 })).toBe(1);
    expect(LocalState.getItem("test-3", { fallback: { foo: "bar" } })).toStrictEqual({ foo: "bar" });
    expect(LocalState.getItem("test-4", { fallback: 1n })).toBe(1n);
    expect(LocalState.getItem("test-5", { fallback: "FizzBuzz" })).toBe("string");
  })

  it("should skip fallback data if value contains `undefined`, `null` or `NaN`", () => {
    LocalState.setItem("test-1", "undefined");
    LocalState.setItem("test-2", "null");
    LocalState.setItem("test-3", "NaN");
    LocalState.setItem("test-4", "bigint");
    LocalState.setItem("test-5", "string");

    expect(LocalState.getItem("test-1", { allowAnyString: true })).toBe("undefined");
    expect(LocalState.getItem("test-2", { allowAnyString: true })).toBe("null");
    expect(LocalState.getItem("test-3", { allowAnyString: true })).toBe("NaN");
    expect(LocalState.getItem("test-4", { allowAnyString: true })).toBe("bigint");
    expect(LocalState.getItem("test-5", { allowAnyString: true })).toBe("string");

    expect(LocalState.getItem("test-1", { allowAnyString: true, fallback: 1n })).toBe(1n);
    expect(LocalState.getItem("test-2", { allowAnyString: true, fallback: 1 })).toBe(1);
    expect(LocalState.getItem("test-3", { allowAnyString: true, fallback: { foo: "bar" } })).toStrictEqual({ foo: "bar" });
    expect(LocalState.getItem("test-4", { allowAnyString: true, fallback: 1n })).toBe(1n);
    expect(LocalState.getItem("test-5", { allowAnyString: true, fallback: "FizzBuzz" })).toBe("string");
  })
});
