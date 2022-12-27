export const filterAnd = (...predicates) => (evt) => {
  return predicates
    .filter(predicate => !predicate(evt))
    .length === 0;
};

export const filterNot = predicate => evt => !predicate(evt);

export enum MouseKey {
  Primary = 1,
  Secondary = 2,
  Auxiliary = 4,
  Fourth = 8, // browser back
  Fifth = 16, // browser forward
}

export const onlyMouseKeyFilter = (mouseKey: MouseKey) => (evt: MouseEvent) => evt.buttons === mouseKey;
