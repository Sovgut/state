import { BaseState } from "../base/base";

export class SessionState extends BaseState {
  static {
    SessionState.type = "SessionState"
    SessionState.provider = sessionStorage;
  }
}
