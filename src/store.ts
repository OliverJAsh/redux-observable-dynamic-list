import { applyMiddleware, createStore } from "redux";
import { createEpicMiddleware } from "redux-observable";
import { create } from "rxjs-spy";
import { Action } from "./actions";
import { rootEpic } from "./epics";
import { reducer } from "./reducers";
import { State } from "./state-types";

const spy = create();
spy.log(/interval/);

//
// Store
//

const configureAndCreateReduxStore = () => {
  const epicMiddleware = createEpicMiddleware<Action, Action, State>();
  const store = createStore(reducer, applyMiddleware(epicMiddleware));
  epicMiddleware.run(rootEpic);
  return store;
};

//
//
//

export const store = configureAndCreateReduxStore();
