import * as React from "react";
import { render } from "react-dom";
import { addCounter, removeCounter } from "./actions";
import { App } from "./components";
import { store } from "./store";

const rootEl = document.getElementById("root");
const subscribeFn = () => {
  const state = store.getState();
  render(<App state={state} />, rootEl);
};
store.subscribe(subscribeFn);
subscribeFn();

store.dispatch(addCounter("foo"));
console.log(store.getState());

setTimeout(() => {
  store.dispatch(addCounter("bar"));
  console.log(store.getState());
}, 2000);

setTimeout(() => {
  store.dispatch(removeCounter("foo"));
  console.log(store.getState());
}, 8000);
