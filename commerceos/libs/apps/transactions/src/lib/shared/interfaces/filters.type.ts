/* eslint-disable no-unused-vars */
import { PeFilterConditions } from '@pe/grid';

export enum FiltersFieldType {
  CreatedAt = 'created_at',
  Status = 'status',
  SpecificStatus = 'specific_status',
  Channel = 'channel',
  Store = 'store',
  Amount = 'amount',
  Total = 'total',
  Currency = 'currency',
  CustomerName = 'customer_name',
  CustomerEmail = 'customer_email',
  MerchantName = 'merchant_name',
  MerchantEmail = 'merchant_email',
  SellerName = 'seller_name',
  SellerEmail = 'seller_email',
  SellerId = 'seller_id',
  Type = 'type',
  OriginalId = 'original_id',
  Reference = 'reference'
}

export type FiltersConditionType = PeFilterConditions;

export enum FiltersOptionsSourcesType {
  PaymentMethods = 'payment_methods',
  SpecificStatuses = 'specific_statuses',
  Statuses = 'statuses',
  Channels = 'channels',
  Stores = 'stores',
  Currencies = 'currencies'
}

export enum ExportFormats {
  CSV = 'csv',
  XLSX = 'xlsx',
  XLS = 'xls',
  // ODS = 'ods',
  PDF = 'pdf'
}
