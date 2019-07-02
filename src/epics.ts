import { Epic } from "redux-observable";
import { merge } from "rxjs";
import { tag } from "rxjs-spy/operators/tag";
import { ajax } from "rxjs/ajax";
import { filter, map, mapTo, mergeMap, takeUntil } from "rxjs/operators";
import {
  Action,
  addedFile,
  checkIsAddedFileAction,
  checkIsRemovedFileAction,
  fileUploaded,
  removedFile
} from "./actions";
import { getDictStateChangeActions } from "./redux-observable";
import { State } from "./state-types";

export const rootEpic: Epic<Action, Action, State> = (action$, state$) => {
  const fileStatesAction$ = state$.pipe(
    map(state => state.fileStates),
    getDictStateChangeActions({
      createAddedAction: addedFile,
      createRemovedAction: removedFile
    })
  );

  const addedFileAction$ = action$.pipe(filter(checkIsAddedFileAction));
  const removedFileAction$ = action$.pipe(filter(checkIsRemovedFileAction));
  const fileAction$ = addedFileAction$.pipe(
    mergeMap(action => {
      const removedThisFileAction$ = removedFileAction$.pipe(
        filter(({ id }) => id === action.id)
      );
      return ajax({ method: "put", url: "https://httpbin.org/put" }).pipe(
        tag(`upload ${action.id}`),
        mapTo(fileUploaded(action.id)),
        // Dynamically unsubscribe from the "child epic"
        takeUntil(removedThisFileAction$)
      );
    })
  );

  return merge(fileStatesAction$, fileAction$);
};
