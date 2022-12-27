export interface FormattedFilter {
  field: string;
  fieldType: 'string' | 'number';
  fieldCondition: string;
  value: string;
  valueIn?: string;
}
