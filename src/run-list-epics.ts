// This helper allows us to run individual epics for each item in a dynamic list (e.g. files in the
// uploader).

// When the list item is added to the list state, the epic will be start running.

// When the list item is removed from the list state, the epic will be unsubscribed from, thereby
// aborting any pending work (e.g. requests).

import { difference, mapValues, omit } from "lodash";
import { Action as ReduxAction } from "redux";
import { ActionsObservable, Epic } from "redux-observable";
import { Observable, OperatorFunction, pipe } from "rxjs";
import { mergeHigherOrderArray } from "rxjs-etc/observable/mergeHigherOrderArray";
import { distinctUntilChanged, filter, map, scan } from "rxjs/operators";
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
> => {
  type ListItemActions = { [id: string]: Observable<Action> };

  const seed: ListItemActions = {};

  return listItemStates$ => {
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

    return listItemStates$.pipe(
      // When an ID is added, invoke the epic and store the result.
      // When an ID is deleted, delete the epic result.
      scan((listItemActions: ListItemActions, listItemStates) => {
        const oldIds = Object.keys(listItemActions);

        const addedStates = omit(listItemStates, oldIds);
        const added = mapValues(addedStates, (listItemState, addedId) => {
          const listItemStateObservable$ = getListItemStateStateObservable(
            addedId,
            listItemState
          );
          const listItemAction$ = listItemEpic(
            action$,
            listItemStateObservable$,
            {}
          );
          return listItemAction$;
        });

        const newIds = Object.keys(listItemStates);
        const deletedIds = difference(oldIds, newIds);
        const afterDeleted = omit(listItemActions, deletedIds);
        return {
          ...added,
          ...afterDeleted
        };
      }, seed),
      map(listItemAction$sById => Object.values(listItemAction$sById)),
      // When an observable is added, subscribe and emit values.
      // When an observable is deleted, unsubscribe.
      mergeHigherOrderArray()
    );
  };
};
