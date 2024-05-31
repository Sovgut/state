import { describe, expect, it } from "vitest";
import { UnsupportedException } from "./unsupported";

describe(UnsupportedException.name, () => {
  it("Should throw exception with message", () => {
    expect.assertions(2);
    expect(() => {
      throw new UnsupportedException("storage");
    }).toThrowError(new UnsupportedException("storage"));
    expect(() => {
      throw new UnsupportedException("type");
    }).toThrowError(new UnsupportedException("type"));
  });
});
