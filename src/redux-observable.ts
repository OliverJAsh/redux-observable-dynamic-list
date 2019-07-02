import { difference } from "lodash";
import { merge, OperatorFunction } from "rxjs";
import { map, mergeMap, pairwise, startWith } from "rxjs/operators";
import { Action } from "./actions";

/**
 * This helper allows us to run individual epics for each item in a dynamic
 * dictionary (e.g. files in the uploader).
 *
 * When an item is added to the dictionary, the epic will start running.
 *
 * When an item is removed from the dictionary, the epic will be unsubscribed
 * from, thereby aborting any pending work (e.g. requests).
 */
export const getDictStateChangeActions = <Value>({
  createAddedAction,
  createRemovedAction
}: {
  createAddedAction: (id: string) => Action;
  createRemovedAction: (id: string) => Action;
}): OperatorFunction<{ [id: string]: Value }, Action> => dict$ => {
  const initialDict: { [id: string]: Value } = {};
  const dictPairs$ = dict$.pipe(
    startWith(initialDict),
    pairwise()
  );

  const addedId$ = dictPairs$.pipe(
    mergeMap(([prev, current]) => {
      const oldIds = Object.keys(prev);
      const currentIds = Object.keys(current);
      return difference(currentIds, oldIds);
    })
  );

  const removedId$ = dictPairs$.pipe(
    mergeMap(([prev, current]) => {
      const oldIds = Object.keys(prev);
      const currentIds = Object.keys(current);
      return difference(oldIds, currentIds);
    })
  );

  return merge(
    addedId$.pipe(map(createAddedAction)),
    removedId$.pipe(map(createRemovedAction))
  );
};
