import { SelectOptionInterface } from '@pe/forms';

export interface CreateBusinessFormIndustryOptionsInterface extends SelectOptionInterface {
  value: string;
  slug: string;
  label: string;
  productCode: string;
  defaultBusinessStatus?: string;
}

export interface CreateBusinessFormInterface {
  [key: string]: any;
}
