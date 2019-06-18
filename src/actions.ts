export enum ActionType {
  AddFile = "AddFile",
  RemoveFile = "RemoveFile",
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
export const checkIsAddFileAction = (action: Action): action is AddFileAction =>
  action.type === ActionType.AddFile;
export type RemoveFileAction = {
  type: ActionType.RemoveFile;
  id: string;
};
export const removeFile = (id: string): RemoveFileAction => ({
  type: ActionType.RemoveFile,
  id
});
export const checkIsRemoveFileAction = (
  action: Action
): action is RemoveFileAction => action.type === ActionType.RemoveFile;
type FileUploadedAction = {
  type: ActionType.FileUploaded;
  id: string;
};
export const fileUploaded = (id: string): FileUploadedAction => ({
  type: ActionType.FileUploaded,
  id
});
export type Action = AddFileAction | RemoveFileAction | FileUploadedAction;
