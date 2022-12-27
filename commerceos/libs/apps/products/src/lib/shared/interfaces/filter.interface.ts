export interface FormattedFilter {
  field: string;
  fieldType: 'string' | 'number';
  fieldCondition: string;
  value: string;
  valueIn?: string;
}

export interface Filter {
  key: string;
  value: string | number | number[] | string[];
  condition?: string;
}
