import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookieState } from "./cookie";

describe(CookieState.name, () => {
  beforeEach(() => {
    CookieState.removeAllListeners();
    CookieState.clear();
  });

  it("should trigger event when a key is set", () => {
    const callback = vi.fn();
    CookieState.on("test-key", callback);

    CookieState.setItem("test-key", "test-value");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "cookie",
    });
  });

  it("should trigger event once when a key is set with once", () => {
    const callback = vi.fn();
    CookieState.once("test-key", callback);

    CookieState.setItem("test-key", "test-value");
    CookieState.setItem("test-key", "another-value");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "cookie",
    });
  });

  it("should not trigger event after it is removed", () => {
    const callback = vi.fn();
    CookieState.on("test-key", callback);
    CookieState.off("test-key", callback);

    CookieState.setItem("test-key", "test-value");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should trigger event when a key is unset", () => {
    const callback = vi.fn();
    CookieState.on("test-key", callback);

    CookieState.setItem("test-key", "test-value");
    CookieState.removeItem("test-key");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      strategy: "cookie",
    });
  });

  it("Write and read data", () => {
    CookieState.setItem("test-1", 1n);
    CookieState.setItem("test-2", 1);
    CookieState.setItem("test-3", "foo");
    CookieState.setItem("test-4", true);
    CookieState.setItem("test-5", {});
    CookieState.setItem("test-6", []);

    expect(CookieState.getItem("test-1")).toBe("1");
    expect(CookieState.getItem("test-2")).toBe("1");
    expect(CookieState.getItem("test-3")).toBe("foo");
    expect(CookieState.getItem("test-4")).toBe("true");
    expect(CookieState.getItem("test-5")).toBe("{}");
    expect(CookieState.getItem("test-6")).toBe("[]");
  });

  it("Remove data", () => {
    CookieState.setItem("test-1", 1n);
    CookieState.setItem("test-2", 1);
    CookieState.setItem("test-3", "foo");
    CookieState.setItem("test-4", true);
    CookieState.setItem("test-5", {});
    CookieState.setItem("test-6", []);

    CookieState.removeItem("test-1");
    CookieState.removeItem("test-2");
    CookieState.removeItem("test-3");
    CookieState.removeItem("test-4");
    CookieState.removeItem("test-5");
    CookieState.removeItem("test-6");

    expect(CookieState.getItem("test-1")).toBe(undefined);
    expect(CookieState.getItem("test-2")).toBe(undefined);
    expect(CookieState.getItem("test-3")).toBe(undefined);
    expect(CookieState.getItem("test-4")).toBe(undefined);
    expect(CookieState.getItem("test-5")).toBe(undefined);
    expect(CookieState.getItem("test-6")).toBe(undefined);
  });

  it("Clear data", () => {
    CookieState.setItem("test-1", 1n);
    CookieState.setItem("test-2", 1);
    CookieState.setItem("test-3", "foo");
    CookieState.setItem("test-4", true);
    CookieState.setItem("test-5", {});
    CookieState.setItem("test-6", []);

    CookieState.clear();

    expect(CookieState.getItem("test-1")).toBe(undefined);
    expect(CookieState.getItem("test-2")).toBe(undefined);
    expect(CookieState.getItem("test-3")).toBe(undefined);
    expect(CookieState.getItem("test-4")).toBe(undefined);
    expect(CookieState.getItem("test-5")).toBe(undefined);
    expect(CookieState.getItem("test-6")).toBe(undefined);
  });

  it("Has data", () => {
    CookieState.setItem("test-1", 1n);
    CookieState.setItem("test-2", 1);
    CookieState.setItem("test-3", "foo");
    CookieState.setItem("test-4", true);
    CookieState.setItem("test-5", {});
    CookieState.setItem("test-6", []);

    expect(CookieState.has("test-1")).toBe(true);
    expect(CookieState.has("test-2")).toBe(true);
    expect(CookieState.has("test-3")).toBe(true);
    expect(CookieState.has("test-4")).toBe(true);
    expect(CookieState.has("test-5")).toBe(true);
    expect(CookieState.has("test-6")).toBe(true);
  });

  it("Fallback data", () => {
    expect(CookieState.getItem("test-1", { fallback: 1n })).toBe(1n);
    expect(CookieState.getItem("test-2", { fallback: 1 })).toBe(1);
    expect(CookieState.getItem("test-3", { fallback: "foo" })).toBe("foo");
    expect(CookieState.getItem("test-4", { fallback: true })).toBe(true);
    expect(CookieState.getItem("test-5", { fallback: {} })).toStrictEqual({});
    expect(CookieState.getItem("test-6", { fallback: [] })).toStrictEqual([]);
  });

  it("Cast data", () => {
    CookieState.setItem("test-1", 1n);
    CookieState.setItem("test-2", 1);
    CookieState.setItem("test-3", "foo");
    CookieState.setItem("test-4", true);
    CookieState.setItem("test-5", {});
    CookieState.setItem("test-6", []);

    CookieState.setItem("test-7", 1n);
    CookieState.setItem("test-8", 1);
    CookieState.setItem("test-9", "foo");
    CookieState.setItem("test-10", true);
    CookieState.setItem("test-11", {});
    CookieState.setItem("test-12", []);

    expect(CookieState.getItem("test-1", { cast: "bigint" })).toBe(1n);
    expect(CookieState.getItem("test-2", { cast: "number" })).toBe(1);
    expect(CookieState.getItem("test-3", { cast: "string" })).toBe("foo");
    expect(CookieState.getItem("test-4", { cast: "boolean" })).toBe(true);
    expect(CookieState.getItem("test-5", { cast: "object" })).toStrictEqual({});
    expect(CookieState.getItem("test-6", { cast: "object" })).toStrictEqual([]);

    expect(CookieState.getItem("test-7", { fallback: 1n })).toBe(1n);
    expect(CookieState.getItem("test-8", { fallback: 1 })).toBe(1);
    expect(CookieState.getItem("test-9", { fallback: "foo" })).toBe("foo");
    expect(CookieState.getItem("test-10", { fallback: true })).toBe(true);
    expect(CookieState.getItem("test-11", { fallback: {} })).toStrictEqual({});
    expect(CookieState.getItem("test-12", { fallback: [] })).toStrictEqual([]);
  });
});
