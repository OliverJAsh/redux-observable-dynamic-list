import { difference, omit } from "lodash";
import { Action as ReduxAction } from "redux";
import { ActionsObservable, Epic } from "redux-observable";
import { OperatorFunction, pipe } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  pairwise,
  startWith,
  takeUntil
} from "rxjs/operators";
import { getStateObservable } from "./redux-observable";

type Nullable<T> = T | null;

// Similar to:
// - fp-ts `catOptions`
// - Haskell `catMaybes`
// but operates on Observables instead of Arrays.
const catNullable$ = <T>(): OperatorFunction<Nullable<T>, T> =>
  pipe(filter((t): t is T => t !== null));

type RunDictEpicsParams<Value, Action extends ReduxAction> = {
  action$: ActionsObservable<Action>;
  selectValue: (
    id: string
  ) => (states: { [id: string]: Value }) => Nullable<Value>;
  valueEpic: Epic<Action, Action, Value>;
};

/**
 * This helper allows us to run individual epics for each item in a dynamic
 * dictionary (e.g. files in the uploader).
 *
 * When an item is added to the dictionary, the epic will start running.
 *
 * When an item is removed from the dictionary, the epic will be unsubscribed
 * from, thereby aborting any pending work (e.g. requests).
 */
export const runDictEpics = <Value, Action extends ReduxAction>({
  action$,
  selectValue,
  valueEpic
}: RunDictEpicsParams<Value, Action>): OperatorFunction<
  { [id: string]: Value },
  Action
> => dict$ => {
  const getValueStateObservable = (id: string, initialState: Value) => {
    const value$ = dict$.pipe(
      map(selectValue(id)),
      // When the dict item is removed, this observable will emit `None` right before it
      // is unsubscribed, so we filter this out.
      catNullable$(),
      distinctUntilChanged()
    );
    return getStateObservable(value$, initialState);
  };

  const initialDict: { [id: string]: Value } = {};
  const dictPairs$ = dict$.pipe(
    startWith(initialDict),
    pairwise()
  );

  const addedStates$ = dictPairs$.pipe(
    map(([prev, current]) => {
      const oldIds = Object.keys(prev);
      return omit(current, oldIds);
    }),
    mergeMap(addedStates => Object.entries(addedStates))
  );

  const removedStateIds$ = dictPairs$.pipe(
    mergeMap(([prev, current]) => {
      const oldIds = Object.keys(prev);
      const currentIds = Object.keys(current);
      return difference(oldIds, currentIds);
    })
  );

  return addedStates$.pipe(
    mergeMap(([id, value]) => {
      const thisStateRemoved$ = removedStateIds$.pipe(
        filter(removedStateId => removedStateId === id)
      );
      const valueStateObservable$ = getValueStateObservable(id, value);
      return valueEpic(action$, valueStateObservable$, {}).pipe(
        takeUntil(thisStateRemoved$)
      );
    })
  );
};
