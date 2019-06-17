// This helper allows us to run individual epics for each item in a dynamic list (e.g. files in the
// uploader).

// When the list item is added to the list state, the epic will be start running.

// When the list item is removed from the list state, the epic will be unsubscribed from, thereby
// aborting any pending work (e.g. requests).

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

type RunListEpicsParams<ListItemState, Action extends ReduxAction> = {
  action$: ActionsObservable<Action>;
  selectListItem: (
    id: string
  ) => (states: { [id: string]: ListItemState }) => Nullable<ListItemState>;
  listItemEpic: Epic<Action, Action, ListItemState>;
};
export const runListEpics = <ListItemState, Action extends ReduxAction>({
  action$,
  selectListItem,
  listItemEpic
}: RunListEpicsParams<ListItemState, Action>): OperatorFunction<
  { [id: string]: ListItemState },
  Action
> => listItemStates$ => {
  const getListItemStateStateObservable = (
    id: string,
    initialState: ListItemState
  ) => {
    const listItemState$ = listItemStates$.pipe(
      map(selectListItem(id)),
      // When the list item is removed, this observable will emit `None` right before it
      // is unsubscribed, so we filter this out.
      catNullable$(),
      distinctUntilChanged()
    );
    return getStateObservable(listItemState$, initialState);
  };

  const initialListItemStates: { [id: string]: ListItemState } = {};
  const listItemStatesPairs$ = listItemStates$.pipe(
    startWith(initialListItemStates),
    pairwise()
  );

  const addedStates$ = listItemStatesPairs$.pipe(
    map(([prev, current]) => {
      const oldIds = Object.keys(prev);
      return omit(current, oldIds);
    }),
    mergeMap(addedStates => Object.entries(addedStates))
  );

  const removedStateIds$ = listItemStatesPairs$.pipe(
    mergeMap(([prev, current]) => {
      const oldIds = Object.keys(prev);
      const currentIds = Object.keys(current);
      return difference(oldIds, currentIds);
    })
  );

  return addedStates$.pipe(
    mergeMap(([id, listItemState]) => {
      const thisStateRemoved$ = removedStateIds$.pipe(
        filter(removedStateId => removedStateId === id)
      );
      const listItemStateObservable$ = getListItemStateStateObservable(
        id,
        listItemState
      );
      return listItemEpic(action$, listItemStateObservable$, {}).pipe(
        takeUntil(thisStateRemoved$)
      );
    })
  );
};
