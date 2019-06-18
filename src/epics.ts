import { Epic } from "redux-observable";
import { timer } from "rxjs";
import { tag } from "rxjs-spy/operators/tag";
import { map, mapTo } from "rxjs/operators";
import { Action, fileUploaded } from "./actions";
import { runListEpics } from "./run-list-epics";
import { FileState, State } from "./state-types";

const fileEpic: Epic<Action, Action, FileState> = (_action$, state$) =>
  timer(1000).pipe(
    tag(`timer ${state$.value.id}`),
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
