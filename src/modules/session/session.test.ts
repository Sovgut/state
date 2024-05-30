import { describe, it, expect } from "vitest";
import { SessionState } from "./session";

describe(SessionState.name, () => {
  it("Write and read data", () => {
    SessionState.set("test-1", 1n);
    SessionState.set("test-2", 1);
    SessionState.set("test-3", "foo");
    SessionState.set("test-4", true);
    SessionState.set("test-5", {});
    SessionState.set("test-6", []);

    expect(SessionState.get("test-1")).toBe("1");
    expect(SessionState.get("test-2")).toBe("1");
    expect(SessionState.get("test-3")).toBe("foo");
    expect(SessionState.get("test-4")).toBe("true");
    expect(SessionState.get("test-5")).toBe("{}");
    expect(SessionState.get("test-6")).toBe("[]");
  });

  it("Remove data", () => {
    SessionState.set("test-1", 1n);
    SessionState.set("test-2", 1);
    SessionState.set("test-3", "foo");
    SessionState.set("test-4", true);
    SessionState.set("test-5", {});
    SessionState.set("test-6", []);

    SessionState.unset("test-1");
    SessionState.unset("test-2");
    SessionState.unset("test-3");
    SessionState.unset("test-4");
    SessionState.unset("test-5");
    SessionState.unset("test-6");

    expect(SessionState.get("test-1")).toBe(undefined);
    expect(SessionState.get("test-2")).toBe(undefined);
    expect(SessionState.get("test-3")).toBe(undefined);
    expect(SessionState.get("test-4")).toBe(undefined);
    expect(SessionState.get("test-5")).toBe(undefined);
    expect(SessionState.get("test-6")).toBe(undefined);
  });

  it("Clear data", () => {
    SessionState.set("test-1", 1n);
    SessionState.set("test-2", 1);
    SessionState.set("test-3", "foo");
    SessionState.set("test-4", true);
    SessionState.set("test-5", {});
    SessionState.set("test-6", []);

    SessionState.clear();

    expect(SessionState.get("test-1")).toBe(undefined);
    expect(SessionState.get("test-2")).toBe(undefined);
    expect(SessionState.get("test-3")).toBe(undefined);
    expect(SessionState.get("test-4")).toBe(undefined);
    expect(SessionState.get("test-5")).toBe(undefined);
    expect(SessionState.get("test-6")).toBe(undefined);
  });

  it("Has data", () => {
    SessionState.set("test-1", 1n);
    SessionState.set("test-2", 1);
    SessionState.set("test-3", "foo");
    SessionState.set("test-4", true);
    SessionState.set("test-5", {});
    SessionState.set("test-6", []);

    expect(SessionState.has("test-1")).toBe(true);
    expect(SessionState.has("test-2")).toBe(true);
    expect(SessionState.has("test-3")).toBe(true);
    expect(SessionState.has("test-4")).toBe(true);
    expect(SessionState.has("test-5")).toBe(true);
    expect(SessionState.has("test-6")).toBe(true);
  });

  it("Fallback data", () => {
    expect(SessionState.get("test-1", { fallback: 1n })).toBe(1n);
    expect(SessionState.get("test-2", { fallback: 1 })).toBe(1);
    expect(SessionState.get("test-3", { fallback: "foo" })).toBe("foo");
    expect(SessionState.get("test-4", { fallback: true })).toBe(true);
    expect(SessionState.get("test-5", { fallback: {} })).toStrictEqual({});
    expect(SessionState.get("test-6", { fallback: [] })).toStrictEqual([]);
  });

  it("Cast data", () => {
    SessionState.set("test-1", 1n);
    SessionState.set("test-2", 1);
    SessionState.set("test-3", "foo");
    SessionState.set("test-4", true);
    SessionState.set("test-5", {});
    SessionState.set("test-6", []);

    SessionState.set("test-7", 1n);
    SessionState.set("test-8", 1);
    SessionState.set("test-9", "foo");
    SessionState.set("test-10", true);
    SessionState.set("test-11", {});
    SessionState.set("test-12", []);

    expect(SessionState.get("test-1", { cast: "bigint" })).toBe(1n);
    expect(SessionState.get("test-2", { cast: "number" })).toBe(1);
    expect(SessionState.get("test-3", { cast: "string" })).toBe("foo");
    expect(SessionState.get("test-4", { cast: "boolean" })).toBe(true);
    expect(SessionState.get("test-5", { cast: "object" })).toStrictEqual({});
    expect(SessionState.get("test-6", { cast: "object" })).toStrictEqual([]);

    expect(SessionState.get("test-7", { fallback: 1n })).toBe(1n);
    expect(SessionState.get("test-8", { fallback: 1 })).toBe(1);
    expect(SessionState.get("test-9", { fallback: "foo" })).toBe("foo");
    expect(SessionState.get("test-10", { fallback: true })).toBe(true);
    expect(SessionState.get("test-11", { fallback: {} })).toStrictEqual({});
    expect(SessionState.get("test-12", { fallback: [] })).toStrictEqual([]);
  });
});
