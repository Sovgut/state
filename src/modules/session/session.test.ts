import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionState } from "./session";

describe(SessionState.name, () => {
  beforeEach(() => {
    SessionState.removeAllListeners();
    SessionState.clear();
  });

  it("should trigger event when a key is set", () => {
    const callback = vi.fn();
    SessionState.on("test-key", callback);

    SessionState.setItem("test-key", "test-value");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "session",
    });
  });

  it("should trigger event once when a key is set with once", () => {
    const callback = vi.fn();
    SessionState.once("test-key", callback);

    SessionState.setItem("test-key", "test-value");
    SessionState.setItem("test-key", "another-value");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "session",
    });
  });

  it("should not trigger event after it is removed", () => {
    const callback = vi.fn();
    SessionState.on("test-key", callback);
    SessionState.off("test-key", callback);

    SessionState.setItem("test-key", "test-value");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should trigger event when a key is unset", () => {
    const callback = vi.fn();
    SessionState.on("test-key", callback);

    SessionState.setItem("test-key", "test-value");
    SessionState.removeItem("test-key");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      strategy: "session",
    });
  });

  it("Write and read data", () => {
    SessionState.setItem("test-1", 1n);
    SessionState.setItem("test-2", 1);
    SessionState.setItem("test-3", "foo");
    SessionState.setItem("test-4", true);
    SessionState.setItem("test-5", {});
    SessionState.setItem("test-6", []);

    expect(SessionState.getItem("test-1")).toBe("1");
    expect(SessionState.getItem("test-2")).toBe("1");
    expect(SessionState.getItem("test-3")).toBe("foo");
    expect(SessionState.getItem("test-4")).toBe("true");
    expect(SessionState.getItem("test-5")).toBe("{}");
    expect(SessionState.getItem("test-6")).toBe("[]");
  });

  it("Remove data", () => {
    SessionState.setItem("test-1", 1n);
    SessionState.setItem("test-2", 1);
    SessionState.setItem("test-3", "foo");
    SessionState.setItem("test-4", true);
    SessionState.setItem("test-5", {});
    SessionState.setItem("test-6", []);

    SessionState.removeItem("test-1");
    SessionState.removeItem("test-2");
    SessionState.removeItem("test-3");
    SessionState.removeItem("test-4");
    SessionState.removeItem("test-5");
    SessionState.removeItem("test-6");

    expect(SessionState.getItem("test-1")).toBe(undefined);
    expect(SessionState.getItem("test-2")).toBe(undefined);
    expect(SessionState.getItem("test-3")).toBe(undefined);
    expect(SessionState.getItem("test-4")).toBe(undefined);
    expect(SessionState.getItem("test-5")).toBe(undefined);
    expect(SessionState.getItem("test-6")).toBe(undefined);
  });

  it("Clear data", () => {
    SessionState.setItem("test-1", 1n);
    SessionState.setItem("test-2", 1);
    SessionState.setItem("test-3", "foo");
    SessionState.setItem("test-4", true);
    SessionState.setItem("test-5", {});
    SessionState.setItem("test-6", []);

    SessionState.clear();

    expect(SessionState.getItem("test-1")).toBe(undefined);
    expect(SessionState.getItem("test-2")).toBe(undefined);
    expect(SessionState.getItem("test-3")).toBe(undefined);
    expect(SessionState.getItem("test-4")).toBe(undefined);
    expect(SessionState.getItem("test-5")).toBe(undefined);
    expect(SessionState.getItem("test-6")).toBe(undefined);
  });

  it("Has data", () => {
    SessionState.setItem("test-1", 1n);
    SessionState.setItem("test-2", 1);
    SessionState.setItem("test-3", "foo");
    SessionState.setItem("test-4", true);
    SessionState.setItem("test-5", {});
    SessionState.setItem("test-6", []);

    expect(SessionState.has("test-1")).toBe(true);
    expect(SessionState.has("test-2")).toBe(true);
    expect(SessionState.has("test-3")).toBe(true);
    expect(SessionState.has("test-4")).toBe(true);
    expect(SessionState.has("test-5")).toBe(true);
    expect(SessionState.has("test-6")).toBe(true);
  });

  it("Fallback data", () => {
    expect(SessionState.getItem("test-1", { fallback: 1n })).toBe(1n);
    expect(SessionState.getItem("test-2", { fallback: 1 })).toBe(1);
    expect(SessionState.getItem("test-3", { fallback: "foo" })).toBe("foo");
    expect(SessionState.getItem("test-4", { fallback: true })).toBe(true);
    expect(SessionState.getItem("test-5", { fallback: {} })).toStrictEqual({});
    expect(SessionState.getItem("test-6", { fallback: [] })).toStrictEqual([]);
  });

  it("Cast data", () => {
    SessionState.setItem("test-1", 1n);
    SessionState.setItem("test-2", 1);
    SessionState.setItem("test-3", "foo");
    SessionState.setItem("test-4", true);
    SessionState.setItem("test-5", {});
    SessionState.setItem("test-6", []);

    SessionState.setItem("test-7", 1n);
    SessionState.setItem("test-8", 1);
    SessionState.setItem("test-9", "foo");
    SessionState.setItem("test-10", true);
    SessionState.setItem("test-11", {});
    SessionState.setItem("test-12", []);

    expect(SessionState.getItem("test-1", { cast: "bigint" })).toBe(1n);
    expect(SessionState.getItem("test-2", { cast: "number" })).toBe(1);
    expect(SessionState.getItem("test-3", { cast: "string" })).toBe("foo");
    expect(SessionState.getItem("test-4", { cast: "boolean" })).toBe(true);
    expect(SessionState.getItem("test-5", { cast: "object" })).toStrictEqual({});
    expect(SessionState.getItem("test-6", { cast: "object" })).toStrictEqual([]);

    expect(SessionState.getItem("test-7", { fallback: 1n })).toBe(1n);
    expect(SessionState.getItem("test-8", { fallback: 1 })).toBe(1);
    expect(SessionState.getItem("test-9", { fallback: "foo" })).toBe("foo");
    expect(SessionState.getItem("test-10", { fallback: true })).toBe(true);
    expect(SessionState.getItem("test-11", { fallback: {} })).toStrictEqual({});
    expect(SessionState.getItem("test-12", { fallback: [] })).toStrictEqual([]);
  });
});
