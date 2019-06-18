import { map } from "lodash";
import * as React from "react";
import { Component } from "react";
import * as uuid from "uuid/v4";
import * as actions from "./actions";
import { FileState, State } from "./state-types";
import { store } from "./store";

class File extends Component<{ fileState: FileState }> {
  render() {
    const { fileState } = this.props;
    const removeFile = () => store.dispatch(actions.removeFile(fileState.id));
    return (
      <div>
        Uploaded: {fileState.isUploaded ? "true" : "false"}
        <button onClick={removeFile}>Remove</button>
      </div>
    );
  }
}

export class App extends Component<{ state: State }> {
  render() {
    const { state } = this.props;
    const fileElements = map(state.fileStates, fileState => {
      return (
        <li key={fileState.id}>
          <File fileState={fileState} />
        </li>
      );
    });
    const addFile = () => store.dispatch(actions.addFile(uuid()));
    return (
      <div>
        <h1>List of files</h1>
        <ul>{fileElements}</ul>
        <button onClick={addFile}>Add</button>
      </div>
    );
  }
}
