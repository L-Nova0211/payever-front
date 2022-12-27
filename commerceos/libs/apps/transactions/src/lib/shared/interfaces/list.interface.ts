import { BehaviorSubject } from 'rxjs';

import { IntegrationCategory } from '@pe/finexp-app';
import { AddressInterface } from '@pe/forms-core';

import { FilterOptionsInterface } from './filters.interface';
import { FiltersConditionType } from './filters.type';
import { PaginationInterface } from './pagination.interface';
import { PaymentType } from './payment.type';
import { StatusType } from './status.type';

export interface CustomFieldsInterface {
  [prop: string]: {
    field: any;
    selected$: BehaviorSubject<boolean>;
  }
}

export interface IntegrationInfoInterface {
  _id: string;
  installed: boolean;
  enabled: boolean;
  integration: {
    name: string,
    category: IntegrationCategory,
    displayOptions: {
      icon: string,
      title: string,
      order?: number
    },
    settingsOptions: {
      source: string,
      action?: string,
      url?: string
    }
  };
}

export interface TransactionInterface {
  action_running: boolean;
  amount: number;
  amount_left: number;
  billing_address: AddressInterface;
  business_uuid: string;
  captured_items: any[];
  channel: string;
  created_at: string;
  currency: string;
  customer_email: string;
  customer_name: string;
  delivery_fee: number;
  down_payment: number;
  items: any[];
  merchant_email: string;
  merchant_name: string;
  seller_email: string; // TODO Not sure that exists at backend
  seller_name: string; // TODO Not sure that exists at backend
  seller_id: string; // TODO Not sure that exists at backend
  original_id: string;
  payment_details: string;
  payment_fee: 0
  payment_flow_id: string;
  reference: string;
  refunded_items: any[];
  santander_applications: any[];
  shipping_address: null
  specific_status: string;
  status: StatusType;
  total: number;
  total_left: number;
  type: PaymentType;
  updated_at: string;
  uuid: string;
  _id: string;
  serviceEntityId: string;
  isFolder?: boolean;
  text?: string;
  item_thumbnail: string;
}

export interface ListResponseInterface {
  collection: TransactionInterface[];
  pagination_data: PaginationInterface;
  usage: FilterOptionsInterface;
}

export interface ListColumnsInterface {
  columns_to_show: string[];
  direction?: string;
  filters?: any;
  id?: number;
  limit?: string;
  order_by?: string;
}

export interface ColumnsInterface {
  columnsToShow: string[];
}

export interface FilterRangeInterface {
  from?: string;
  to?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchFilterInterface {
  condition: FiltersConditionType | string;
  value: any;
}

export interface SearchFiltersInterface {
  [propName: string]: SearchFilterInterface[]; // Non-array for hardcoded not editable filters, like channel_set_uuid
}

export interface SearchTransactionsInterface {
  orderBy?: string;
  direction?: string;
  configuration?: SearchFiltersInterface;
  search?: string;
  page?: number;
  perPage?: number;
  created_at?: string;
  currency?: string;
}

export interface SortInterface {
  orderBy: string;
  direction: string;
}


export interface ActiveColumnInterface {
  name: string;
  title: string
}
