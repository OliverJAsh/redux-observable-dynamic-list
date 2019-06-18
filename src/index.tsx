import * as React from "react";
import { render } from "react-dom";
import { addFile, removeFile } from "./actions";
import { App } from "./components";
import { store } from "./store";

const rootEl = document.getElementById("root");
const subscribeFn = () => {
  const state = store.getState();
  render(<App state={state} />, rootEl);
};
store.subscribe(subscribeFn);
subscribeFn();

store.dispatch(addFile("foo"));
console.log(store.getState());

setTimeout(() => {
  store.dispatch(addFile("bar"));
  console.log(store.getState());
}, 2000);

setTimeout(() => {
  store.dispatch(removeFile("foo"));
  console.log(store.getState());
}, 8000);
