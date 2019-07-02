import { Epic } from "redux-observable";
import { tag } from "rxjs-spy/operators/tag";
import { ajax } from "rxjs/ajax";
import { filter, groupBy, mapTo, mergeMap, takeUntil } from "rxjs/operators";
import {
  Action,
  checkIsAddFileAction,
  checkIsRemoveFileAction,
  fileUploaded
} from "./actions";
import { State } from "./state-types";

export const rootEpic: Epic<Action, Action, State> = (action$, _state$) => {
  const addFileAction$ = action$.pipe(filter(checkIsAddFileAction));
  const removeFileAction$ = action$.pipe(filter(checkIsRemoveFileAction));
  const fileAction$ = addFileAction$.pipe(
    groupBy(action => action.id),
    mergeMap(group =>
      group.pipe(
        // Run one Observable per file
        mergeMap(action => {
          const removeThisFileAction$ = removeFileAction$.pipe(
            filter(({ id }) => id === action.id)
          );
          return ajax({ method: "put", url: "https://httpbin.org/put" }).pipe(
            tag(`upload ${action.id}`),
            mapTo(fileUploaded(action.id)),
            // Dynamically unsubscribe from the Observable
            takeUntil(removeThisFileAction$)
          );
        })
      )
    )
  );
  return fileAction$;
};
