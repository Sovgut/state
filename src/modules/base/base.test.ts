import { afterEach, describe, expect, it } from "vitest";
import { BaseState } from "./base";
import { UnsupportedException } from "@/errors/unsupported/unsupported";

afterEach(() => (BaseState.provider = undefined));

describe(BaseState.name, () => {
  it("Write and read data", () => {
    expect.assertions(2);

    expect(() => BaseState.set("test", 1)).toThrowError(
      new UnsupportedException("provider")
    );
    expect(() => BaseState.get("test")).toThrowError(
      new UnsupportedException("provider")
    );
  });

  it("Read data from provider", () => {
    BaseState.provider = localStorage;

    expect(BaseState.get("test", { fallback: "test" })).toBe("test");
  });

  it("Remove data", () => {
    expect.assertions(1);

    expect(() => BaseState.unset("test")).toThrowError(
      new UnsupportedException("provider")
    );
  });

  it("Clear data", () => {
    expect.assertions(1);

    expect(() => BaseState.clear()).toThrowError(
      new UnsupportedException("provider")
    );
  });

  it("Has data", () => {
    expect.assertions(1);

    expect(() => BaseState.has("test")).toThrowError(
      new UnsupportedException("provider")
    );
  });
});
