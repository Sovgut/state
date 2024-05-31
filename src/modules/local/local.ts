import { BaseState } from "../base/base";

export class LocalState extends BaseState {
  static {
    LocalState.strategy = "local"
    LocalState.storage = localStorage;
  }
}
