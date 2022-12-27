export interface FilterOptionInterface {
  key?: string;
  id?: string;
  name: string;
}

export interface FilterOptionsInterface {
  [propName: string]: (string|FilterOptionInterface)[];
}
