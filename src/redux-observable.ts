import { StateObservable } from "redux-observable";
import { Observable, Subject } from "rxjs";

export const getStateObservable = <State>(
  state$: Observable<State>,
  initialState: State
) => {
  // `StateObservable`'s types ask for a `Subject`, but the code doesn't actually need
  // one. To avoid the hassle of converting our `Observable` to a `Subject`, we just cast
  // the type.
  // https://github.com/redux-observable/redux-observable/issues/570
  const stateSubject = state$ as Subject<State>;
  const stateStateObservable = new StateObservable(stateSubject, initialState);
  return stateStateObservable;
};
