export interface ListOptionInterface<T = string> {
  label: string;
  value: T;
}

export interface TranslatedListOptionInterface<T = string> extends Omit<ListOptionInterface<T>, 'label'> {
  labelKey: string;
}
