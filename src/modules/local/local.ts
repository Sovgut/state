import { BaseState } from "../base/base";

export class LocalState extends BaseState {
  static {
    LocalState.type = "LocalState"
    LocalState.provider = localStorage;
  }
}
