import { Epic } from "redux-observable";
import { EMPTY } from "rxjs";
import { Action } from "./actions";
import { State } from "./state-types";

export const rootEpic: Epic<Action, Action, State> = (_action$, _state$) => {
  return EMPTY;
};
