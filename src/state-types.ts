export type CounterState = {
  id: string;
  counter: number;
};
export type CounterStates = {
  [id: string]: CounterState;
};
export type State = {
  counterStates: CounterStates;
};
