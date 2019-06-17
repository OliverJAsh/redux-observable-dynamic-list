import { Epic } from "redux-observable";
import { interval } from "rxjs";
import { tag } from "rxjs-spy/operators/tag";
import { map, mapTo } from "rxjs/operators";
import { Action, incrementCounter } from "./actions";
import { runListEpics } from "./run-list-epics";
import { CounterState, State } from "./state-types";

const counterEpic: Epic<Action, Action, CounterState> = (_action$, state$) =>
  interval(1000).pipe(
    tag(`interval ${state$.value.id}`),
    mapTo(incrementCounter(state$.value.id))
  );

export const rootEpic: Epic<Action, Action, State> = (action$, state$) => {
  const counterAction$ = state$.pipe(
    map(state => state.counterStates),
    runListEpics({
      action$,
      listItemEpic: counterEpic,
      selectListItem: id => counterStates => counterStates[id]
    })
  );
  return counterAction$;
};
