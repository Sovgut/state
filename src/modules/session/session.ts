import { BaseState } from "../base/base";

export class SessionState extends BaseState {
  static {
    SessionState.provider = sessionStorage;
  }
}
