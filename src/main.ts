export { LocalState } from "~/common/LocalState/LocalState";
export { MemoryState } from "~/common/MemoryState/MemoryState";
export { SessionState } from "~/common/SessionState/SessionState";
export { CookieState, type CookieOptions } from "~/common/CookieState/CookieState";

export type { IStorageEventData } from "~/types";
export type { Callback } from "~/common/Observer/Observer";
export type { Options, CastTarget } from "~/common/internal/resolveValue";

export { StateDoesNotExist } from "~/errors/StateDoesNotExist";
export { StateInvalidCast } from "~/errors/StateInvalidCast";