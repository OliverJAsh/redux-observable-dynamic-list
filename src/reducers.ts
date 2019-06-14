import * as _ from "lodash";
import { Action as ReduxAction, AnyAction, Reducer } from "redux";
import { Action, ActionType } from "./actions";
import { CounterState, CounterStates, State } from "./state-types";

type ReducerWithoutInitial<S, A extends ReduxAction = AnyAction> = (
  state: S,
  action: A
) => S;

const counterStateReducer: ReducerWithoutInitial<CounterState, Action> = (
  prevState,
  action
) => {
  switch (action.type) {
    case ActionType.IncrementCounter: {
      const idToUpdate = action.id;
      if (prevState.id === idToUpdate) {
        const updatedState = {
          ...prevState,
          counter: prevState.counter + 1
        };
        return updatedState;
      } else {
        return prevState;
      }
    }
    default:
      return prevState;
  }
};

const initialState: State = {
  counterStates: {}
};

export const reducer: Reducer<State, Action> = (
  prevState = initialState,
  action
) => {
  switch (action.type) {
    case ActionType.AddCounter: {
      const newCounters: CounterStates = {
        [action.id]: { id: action.id, counter: 0 }
      };
      const updatedCounters = { ...prevState.counterStates, ...newCounters };
      const updatedState = {
        ...prevState,
        counterStates: updatedCounters
      };
      return updatedState;
    }
    case ActionType.RemoveCounter: {
      const idToRemove = action.id;
      const updatedCounters = _.omitBy(
        prevState.counterStates,
        counterState => counterState.id == idToRemove
      );
      const updatedState = {
        ...prevState,
        counterStates: updatedCounters
      };
      return updatedState;
    }
    case ActionType.IncrementCounter: {
      const updatedCounters = _.mapValues(
        prevState.counterStates,
        prevCounterState => counterStateReducer(prevCounterState, action)
      );
      const updatedState = {
        ...prevState,
        counterStates: updatedCounters
      };
      return updatedState;
    }
    default: {
      return prevState;
    }
  }
};
