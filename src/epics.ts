import { Epic } from "redux-observable";
import { interval } from "rxjs";
import { tag } from "rxjs-spy/operators/tag";
import { filter, map, mapTo, mergeMap, takeUntil } from "rxjs/operators";
import {
  Action,
  checkIsAddCounterAction,
  checkIsRemoveCounterAction,
  incrementCounter
} from "./actions";
import { getStateObservable } from "./redux-observable";
import { CounterState, State } from "./state-types";

const counterEpic: Epic<Action, Action, CounterState> = (_action$, state$) =>
  interval(1000).pipe(
    tag(`interval ${state$.value.id}`),
    mapTo(incrementCounter(state$.value.id))
  );

export const rootEpic: Epic<Action, Action, State> = (action$, state$) => {
  const addCounterAction$ = action$.pipe(filter(checkIsAddCounterAction));
  const removeCounterAction$ = action$.pipe(filter(checkIsRemoveCounterAction));
  const counterAction$ = addCounterAction$.pipe(
    // Run one child epic per counter
    mergeMap(action => {
      const removeThisCounterAction$ = removeCounterAction$.pipe(
        filter(({ id }) => id === action.id)
      );
      const getState = (state: State) => state.counterStates[action.id];
      const initialState = getState(state$.value);
      const counterStateObservable = getStateObservable(
        state$.pipe(map(getState)),
        initialState
      );
      return counterEpic(action$, counterStateObservable, {}).pipe(
        // Dynamically unsubscribe from the child epic
        takeUntil(removeThisCounterAction$)
      );
    })
  );
  return counterAction$;
};
