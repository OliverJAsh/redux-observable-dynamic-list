import { Epic } from "redux-observable";
import { tag } from "rxjs-spy/operators/tag";
import { ajax } from "rxjs/ajax";
import {
  filter,
  groupBy,
  map,
  mapTo,
  mergeMap,
  takeUntil
} from "rxjs/operators";
import {
  Action,
  checkIsAddFileAction,
  checkIsRemoveFileAction,
  fileUploaded
} from "./actions";
import { getStateObservable } from "./redux-observable";
import { FileState, State } from "./state-types";

const fileEpic: Epic<Action, Action, FileState> = (_action$, state$) =>
  ajax({ method: "put", url: "https://httpbin.org/put" }).pipe(
    tag(`upload ${state$.value.id}`),
    mapTo(fileUploaded(state$.value.id))
  );

export const rootEpic: Epic<Action, Action, State> = (action$, state$) => {
  const addFileAction$ = action$.pipe(filter(checkIsAddFileAction));
  const removeFileAction$ = action$.pipe(filter(checkIsRemoveFileAction));
  const fileAction$ = addFileAction$.pipe(
    groupBy(action => action.id),
    mergeMap(group =>
      group.pipe(
        // Run one child epic per file
        mergeMap(action => {
          const removeThisFileAction$ = removeFileAction$.pipe(
            filter(({ id }) => id === action.id)
          );
          const getState = (state: State) => state.fileStates[action.id];
          const initialState = getState(state$.value);
          const fileStateObservable = getStateObservable(
            state$.pipe(map(getState)),
            initialState
          );
          return fileEpic(action$, fileStateObservable, {}).pipe(
            // Dynamically unsubscribe from the child epic
            takeUntil(removeThisFileAction$)
          );
        })
      )
    )
  );
  return fileAction$;
};
