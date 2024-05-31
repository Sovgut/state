import { BaseState } from "../base/base";

export class SessionState extends BaseState {
  static {
    SessionState.type = "session"
    SessionState.provider = sessionStorage;
  }
}
