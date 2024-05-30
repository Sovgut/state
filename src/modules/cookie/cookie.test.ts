import { describe, expect, it } from "vitest";
import { CookieState } from "./cookie";

describe(CookieState.name, () => {
  it("Write and read data", () => {
    CookieState.set("test-1", 1n);
    CookieState.set("test-2", 1);
    CookieState.set("test-3", "foo");
    CookieState.set("test-4", true);
    CookieState.set("test-5", {});
    CookieState.set("test-6", []);

    expect(CookieState.get("test-1")).toBe("1");
    expect(CookieState.get("test-2")).toBe("1");
    expect(CookieState.get("test-3")).toBe("foo");
    expect(CookieState.get("test-4")).toBe("true");
    expect(CookieState.get("test-5")).toBe("{}");
    expect(CookieState.get("test-6")).toBe("[]");
  });

  it("Remove data", () => {
    CookieState.set("test-1", 1n);
    CookieState.set("test-2", 1);
    CookieState.set("test-3", "foo");
    CookieState.set("test-4", true);
    CookieState.set("test-5", {});
    CookieState.set("test-6", []);

    CookieState.unset("test-1");
    CookieState.unset("test-2");
    CookieState.unset("test-3");
    CookieState.unset("test-4");
    CookieState.unset("test-5");
    CookieState.unset("test-6");

    expect(CookieState.get("test-1")).toBe(undefined);
    expect(CookieState.get("test-2")).toBe(undefined);
    expect(CookieState.get("test-3")).toBe(undefined);
    expect(CookieState.get("test-4")).toBe(undefined);
    expect(CookieState.get("test-5")).toBe(undefined);
    expect(CookieState.get("test-6")).toBe(undefined);
  });

  it("Clear data", () => {
    CookieState.set("test-1", 1n);
    CookieState.set("test-2", 1);
    CookieState.set("test-3", "foo");
    CookieState.set("test-4", true);
    CookieState.set("test-5", {});
    CookieState.set("test-6", []);

    CookieState.clear();

    expect(CookieState.get("test-1")).toBe(undefined);
    expect(CookieState.get("test-2")).toBe(undefined);
    expect(CookieState.get("test-3")).toBe(undefined);
    expect(CookieState.get("test-4")).toBe(undefined);
    expect(CookieState.get("test-5")).toBe(undefined);
    expect(CookieState.get("test-6")).toBe(undefined);
  });

  it("Has data", () => {
    CookieState.set("test-1", 1n);
    CookieState.set("test-2", 1);
    CookieState.set("test-3", "foo");
    CookieState.set("test-4", true);
    CookieState.set("test-5", {});
    CookieState.set("test-6", []);

    expect(CookieState.has("test-1")).toBe(true);
    expect(CookieState.has("test-2")).toBe(true);
    expect(CookieState.has("test-3")).toBe(true);
    expect(CookieState.has("test-4")).toBe(true);
    expect(CookieState.has("test-5")).toBe(true);
    expect(CookieState.has("test-6")).toBe(true);
  });

  it("Fallback data", () => {
    expect(CookieState.get("test-1", { fallback: 1n })).toBe(1n);
    expect(CookieState.get("test-2", { fallback: 1 })).toBe(1);
    expect(CookieState.get("test-3", { fallback: "foo" })).toBe("foo");
    expect(CookieState.get("test-4", { fallback: true })).toBe(true);
    expect(CookieState.get("test-5", { fallback: {} })).toStrictEqual({});
    expect(CookieState.get("test-6", { fallback: [] })).toStrictEqual([]);
  });

  it("Cast data", () => {
    CookieState.set("test-1", 1n);
    CookieState.set("test-2", 1);
    CookieState.set("test-3", "foo");
    CookieState.set("test-4", true);
    CookieState.set("test-5", {});
    CookieState.set("test-6", []);

    CookieState.set("test-7", 1n);
    CookieState.set("test-8", 1);
    CookieState.set("test-9", "foo");
    CookieState.set("test-10", true);
    CookieState.set("test-11", {});
    CookieState.set("test-12", []);

    expect(CookieState.get("test-1", { cast: "bigint" })).toBe(1n);
    expect(CookieState.get("test-2", { cast: "number" })).toBe(1);
    expect(CookieState.get("test-3", { cast: "string" })).toBe("foo");
    expect(CookieState.get("test-4", { cast: "boolean" })).toBe(true);
    expect(CookieState.get("test-5", { cast: "object" })).toStrictEqual({});
    expect(CookieState.get("test-6", { cast: "object" })).toStrictEqual([]);

    expect(CookieState.get("test-7", { fallback: 1n })).toBe(1n);
    expect(CookieState.get("test-8", { fallback: 1 })).toBe(1);
    expect(CookieState.get("test-9", { fallback: "foo" })).toBe("foo");
    expect(CookieState.get("test-10", { fallback: true })).toBe(true);
    expect(CookieState.get("test-11", { fallback: {} })).toStrictEqual({});
    expect(CookieState.get("test-12", { fallback: [] })).toStrictEqual([]);
  });
});
