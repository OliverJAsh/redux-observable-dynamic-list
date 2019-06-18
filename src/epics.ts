import { Epic } from "redux-observable";
import { merge } from "rxjs";
import { tag } from "rxjs-spy/operators/tag";
import { ajax } from "rxjs/ajax";
import { filter, map, mapTo, mergeMap, takeUntil } from "rxjs/operators";
import {
  Action,
  checkIsAddedFileAction,
  checkIsRemovedFileAction,
  fileUploaded
} from "./actions";
import {
  getDictStateChangeActions,
  getStateObservable
} from "./redux-observable";
import { FileState, State } from "./state-types";

const fileEpic: Epic<Action, Action, FileState> = (_action$, state$) =>
  ajax({ method: "put", url: "https://httpbin.org/put" }).pipe(
    tag(`upload ${state$.value.id}`),
    mapTo(fileUploaded(state$.value.id))
  );

export const rootEpic: Epic<Action, Action, State> = (action$, state$) => {
  const fileStatesAction$ = state$.pipe(
    map(state => state.fileStates),
    getDictStateChangeActions()
  );

  const addedFileAction$ = action$.pipe(filter(checkIsAddedFileAction));
  const removedFileAction$ = action$.pipe(filter(checkIsRemovedFileAction));
  const fileAction$ = addedFileAction$.pipe(
    mergeMap(action => {
      const removedThisFileAction$ = removedFileAction$.pipe(
        filter(({ id }) => id === action.id)
      );
      const getState = (state: State) => state.fileStates[action.id];
      const initialState = getState(state$.value);
      const fileStateObservable = getStateObservable(
        state$.pipe(map(getState)),
        initialState
      );
      return fileEpic(action$, fileStateObservable, {}).pipe(
        // Dynamically unsubscribe from the "child epic"
        takeUntil(removedThisFileAction$)
      );
    })
  );

  return merge(fileStatesAction$, fileAction$);
};
