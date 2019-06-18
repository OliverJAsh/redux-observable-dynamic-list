export enum ActionType {
  AddFile = "AddFile",
  AddedFile = "AddedFile",
  RemoveFile = "RemoveFile",
  RemovedFile = "RemovedFile",
  FileUploaded = "FileUploaded"
}
export type AddFileAction = {
  type: ActionType.AddFile;
  id: string;
};
export const addFile = (id: string): AddFileAction => ({
  type: ActionType.AddFile,
  id
});
export type AddedFileAction = {
  type: ActionType.AddedFile;
  id: string;
};
export const addedFile = (id: string): AddedFileAction => ({
  type: ActionType.AddedFile,
  id
});
export const checkIsAddedFileAction = (
  action: Action
): action is AddedFileAction => action.type === ActionType.AddedFile;
export type RemoveFileAction = {
  type: ActionType.RemoveFile;
  id: string;
};
export const removeFile = (id: string): RemoveFileAction => ({
  type: ActionType.RemoveFile,
  id
});
export const checkIsRemovedFileAction = (
  action: Action
): action is RemovedFileAction => action.type === ActionType.RemovedFile;
export type RemovedFileAction = {
  type: ActionType.RemovedFile;
  id: string;
};
export const removedFile = (id: string): RemovedFileAction => ({
  type: ActionType.RemovedFile,
  id
});
type FileUploadedAction = {
  type: ActionType.FileUploaded;
  id: string;
};
export const fileUploaded = (id: string): FileUploadedAction => ({
  type: ActionType.FileUploaded,
  id
});
export type Action =
  | AddFileAction
  | AddedFileAction
  | RemoveFileAction
  | RemovedFileAction
  | FileUploadedAction;
