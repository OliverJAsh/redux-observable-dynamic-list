export type FileState = {
  id: string;
  isUploaded: boolean;
};
export type FileStates = {
  [id: string]: FileState;
};
export type State = {
  fileStates: FileStates;
};
