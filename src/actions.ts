export enum ActionType {
  AddCounter = "AddCounter",
  RemoveCounter = "RemoveCounter",
  IncrementCounter = "IncrementCounter"
}
export type AddCounterAction = {
  type: ActionType.AddCounter;
  id: string;
};
export const addCounter = (id: string): AddCounterAction => ({
  type: ActionType.AddCounter,
  id
});
export const checkIsAddCounterAction = (
  action: Action
): action is AddCounterAction => action.type === ActionType.AddCounter;
export type RemoveCounterAction = {
  type: ActionType.RemoveCounter;
  id: string;
};
export const removeCounter = (id: string): RemoveCounterAction => ({
  type: ActionType.RemoveCounter,
  id
});
export const checkIsRemoveCounterAction = (
  action: Action
): action is RemoveCounterAction => action.type === ActionType.RemoveCounter;
type IncrementCounterAction = {
  type: ActionType.IncrementCounter;
  id: string;
};
export const incrementCounter = (id: string): IncrementCounterAction => ({
  type: ActionType.IncrementCounter,
  id
});
export type Action =
  | AddCounterAction
  | RemoveCounterAction
  | IncrementCounterAction;
