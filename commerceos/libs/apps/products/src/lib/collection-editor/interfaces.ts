import { Filter } from '../shared/interfaces/filter.interface';
import { Product } from '../shared/interfaces/product.interface';

import { ConditionClause, ConditionsType } from './enums';

export const mimeTypes = 'png|jpg|jpeg|bmp';

export interface Condition {
  key: string;
  value: string | number | number[] | string[];
  condition: ConditionClause;
}

export interface MainSection {
  images: string[];
  image: string;
  name: string;
  conditions?: {
    type: ConditionsType;
    filters: Filter[];
  };
}

export interface ContentSection {
  description: string;
}

export interface ProductsSection {
  products: Product[];
}

export interface ExternalError {
  section: string;
  field: MainSection | string;
  errorText: string;
}


export interface PeProductCustomerGroupInterface {
  id: string;
  businessId: string;
  name: string;
  isDefault: boolean;
}

export interface PeProductCustomerFieldValueInterface {
  businessId: string;
  id: string;
  name: string;
  type: string;
  groupId: string;
}

export interface PeProductCustomerFieldInterface {
  fieldId: string;
  id: string;
  value: string;
  contactId: string;
  field: PeProductCustomerFieldValueInterface;
}

export interface PeProductCustomerFieldWrapperInterface {
  nodes: PeProductCustomerFieldInterface[];
}

export interface PeProductCustomerInterface {
  id: string;
  businessId: string;
  type: string;
  contactFields: PeProductCustomerFieldWrapperInterface;
}

export interface PeProductCustomersInterface {
  [key: string]: boolean | number | string;
}


export interface PeProductOptionInterface {
  id:string;
  title: string;
  value: string;
}
