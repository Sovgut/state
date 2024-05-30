import { BaseState } from "../base/base";

export class LocalState extends BaseState {
  static {
    LocalState.provider = localStorage;
  }
}
