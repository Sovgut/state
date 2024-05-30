import { describe, expect, it } from "vitest";
import { UnsupportedException } from "./unsupported";

describe(UnsupportedException.name, () => {
  it("Should throw exception with message", () => {
    expect.assertions(2);
    expect(() => {
      throw new UnsupportedException("provider");
    }).toThrowError(new UnsupportedException("provider"));
    expect(() => {
      throw new UnsupportedException("type");
    }).toThrowError(new UnsupportedException("type"));
  });
});
