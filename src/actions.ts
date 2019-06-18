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
export type RemoveFileAction = {
  type: ActionType.RemoveFile;
  id: string;
};
export const removeFile = (id: string): RemoveFileAction => ({
  type: ActionType.RemoveFile,
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
export type Action = AddFileAction | RemoveFileAction | FileUploadedAction;
