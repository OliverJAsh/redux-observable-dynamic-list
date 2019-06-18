import * as _ from "lodash";
import { Action as ReduxAction, AnyAction, Reducer } from "redux";
import { Action, ActionType } from "./actions";
import { FileState, FileStates, State } from "./state-types";

type ReducerWithoutInitial<S, A extends ReduxAction = AnyAction> = (
  state: S,
  action: A
) => S;

const fileStateReducer: ReducerWithoutInitial<FileState, Action> = (
  prevState,
  action
) => {
  switch (action.type) {
    case ActionType.FileUploaded: {
      const idToUpdate = action.id;
      if (prevState.id === idToUpdate) {
        const updatedState = {
          ...prevState,
          isUploaded: true
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
  fileStates: {}
};

export const reducer: Reducer<State, Action> = (
  prevState = initialState,
  action
) => {
  switch (action.type) {
    case ActionType.AddFile: {
      const newFiles: FileStates = {
        [action.id]: { id: action.id, isUploaded: false }
      };
      const updatedFiles = { ...prevState.fileStates, ...newFiles };
      const updatedState = {
        ...prevState,
        fileStates: updatedFiles
      };
      return updatedState;
    }
    case ActionType.RemoveFile: {
      const idToRemove = action.id;
      const updatedFiles = _.omitBy(
        prevState.fileStates,
        fileState => fileState.id == idToRemove
      );
      const updatedState = {
        ...prevState,
        fileStates: updatedFiles
      };
      return updatedState;
    }
    case ActionType.FileUploaded: {
      const updatedFiles = _.mapValues(prevState.fileStates, prevFileState =>
        fileStateReducer(prevFileState, action)
      );
      const updatedState = {
        ...prevState,
        fileStates: updatedFiles
      };
      return updatedState;
    }
    default: {
      return prevState;
    }
  }
};
