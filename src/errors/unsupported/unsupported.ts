export class UnsupportedException extends Error {
  constructor(readonly type: "storage" | "type") {
    super(`UnsupportedException: ${type} is unsupported or unavailable.`);
  }
}
