export class UnsupportedException extends Error {
  constructor(readonly type: "provider" | "type") {
    super(`UnsupportedException: ${type} is unsupported or unavailable.`);
  }
}
