import { Epic } from "redux-observable";
import { tag } from "rxjs-spy/operators/tag";
import { ajax } from "rxjs/ajax";
import { map, mapTo } from "rxjs/operators";
import { Action, fileUploaded } from "./actions";
import { runListEpics } from "./run-list-epics";
import { FileState, State } from "./state-types";

const fileEpic: Epic<Action, Action, FileState> = (_action$, state$) =>
  ajax({ url: "https://httpbin.org/put" }).pipe(
    tag(`upload ${state$.value.id}`),
    mapTo(fileUploaded(state$.value.id))
  );

export const rootEpic: Epic<Action, Action, State> = (action$, state$) => {
  const fileAction$ = state$.pipe(
    map(state => state.fileStates),
    runListEpics({
      action$,
      listItemEpic: fileEpic,
      selectListItem: id => fileStates => fileStates[id]
    })
  );
  return fileAction$;
};
