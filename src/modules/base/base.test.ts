import { afterEach, describe, expect, it, vi } from "vitest";
import { BaseState } from "./base";
import { UnsupportedException } from "@/errors/unsupported/unsupported";

afterEach(() => (BaseState.storage = undefined));

describe(BaseState.name, () => {
  it("should trigger event when a key is set", () => {
    BaseState.removeAllListeners();
    BaseState.storage = localStorage;
    BaseState.clear();

    const callback = vi.fn();
    BaseState.on("test-key", callback);

    BaseState.set("test-key", "test-value");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "base",
    });
  });

  it("should trigger event once when a key is set with once", () => {
    BaseState.removeAllListeners();
    BaseState.storage = localStorage;
    BaseState.clear();

    const callback = vi.fn();
    BaseState.once("test-key", callback);

    BaseState.set("test-key", "test-value");
    BaseState.set("test-key", "another-value");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      value: "test-value",
      strategy: "base",
    });
  });

  it("should not trigger event after it is removed", () => {
    BaseState.removeAllListeners();
    BaseState.storage = localStorage;
    BaseState.clear();

    const callback = vi.fn();
    BaseState.on("test-key", callback);
    BaseState.off("test-key", callback);

    BaseState.set("test-key", "test-value");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should trigger event when a key is unset", () => {
    BaseState.removeAllListeners();
    BaseState.storage = localStorage;
    BaseState.clear();

    const callback = vi.fn();
    BaseState.on("test-key", callback);

    BaseState.set("test-key", "test-value");
    BaseState.unset("test-key");

    expect(callback).toHaveBeenCalledWith({
      key: "test-key",
      strategy: "base",
    });
  });

  it("Write and read data", () => {
    expect.assertions(2);

    expect(() => BaseState.set("test", 1)).toThrowError(
      new UnsupportedException("storage")
    );
    expect(() => BaseState.get("test")).toThrowError(
      new UnsupportedException("storage")
    );
  });

  it("Read data from storage", () => {
    BaseState.storage = localStorage;

    expect(BaseState.get("test", { fallback: "test" })).toBe("test");
  });

  it("Remove data", () => {
    expect.assertions(1);

    expect(() => BaseState.unset("test")).toThrowError(
      new UnsupportedException("storage")
    );
  });

  it("Clear data", () => {
    expect.assertions(1);

    expect(() => BaseState.clear()).toThrowError(
      new UnsupportedException("storage")
    );
  });

  it("Has data", () => {
    expect.assertions(1);

    expect(() => BaseState.has("test")).toThrowError(
      new UnsupportedException("storage")
    );
  });
});
