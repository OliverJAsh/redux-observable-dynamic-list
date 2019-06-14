import { map } from "lodash";
import * as React from "react";
import { Component } from "react";
import * as uuid from "uuid/v4";
import * as actions from "./actions";
import { CounterState, State } from "./state-types";
import { store } from "./store";

class Counter extends Component<{ counterState: CounterState }> {
  render() {
    const { counterState } = this.props;
    const removeCounter = () =>
      store.dispatch(actions.removeCounter(counterState.id));
    return (
      <div>
        {counterState.counter}
        <button onClick={removeCounter}>Remove</button>
      </div>
    );
  }
}

export class App extends Component<{ state: State }> {
  render() {
    const { state } = this.props;
    const counterElements = map(state.counterStates, counterState => {
      return (
        <li key={counterState.id}>
          <Counter counterState={counterState} />
        </li>
      );
    });
    const addCounter = () => store.dispatch(actions.addCounter(uuid()));
    return (
      <div>
        <h1>List of counters</h1>
        <ul>{counterElements}</ul>
        <button onClick={addCounter}>Add</button>
      </div>
    );
  }
}
