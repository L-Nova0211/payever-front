import { BusinessInterface } from '@pe/builder-core';
import { PeFilterConditions } from '@pe/grid';

import { ProductTypes } from '../enums/product.enum';

import { Category } from './category.interface';
import { ChannelSetInterface } from './channel-set.interface';
import { Collection } from './collection.interface';
import { Pagination } from './pagination.interface';
import { RecommendationsInterface } from './recommendations.interface';
import { AttributesSection, PricingSection, SeoSection, ShippingSection, VariantsSection } from './section.interface';

export type FiltersConditionType = PeFilterConditions;

export interface SearchFilterInterface {
  condition: FiltersConditionType | string;
  value: any;
}

export interface SearchFiltersInterface {
  [propName: string]: SearchFilterInterface[]; // Non-array for hardcoded not editable filters, like channel_set_uuid
}

export interface ProductStockInfo {
  stock: number;
  isTrackable: boolean;
}

export interface ProductInventoryInterface {
  sku: string;
  inventory: number;
  inventoryTrackingEnabled: boolean;
  barcode: string;
  lowInventory?: number;
  emailLowStock?: boolean;
}
export interface ProductModel extends ProductInventoryInterface {
  [key: string]: any;
  id?: string;
  title: string;
  description: string;
  sale: ProductModelSale
  available: boolean;
  price: number;
  country: string;
  language: string;
  company?: string;
  priceTable: PriceTable[];
  categories?: Category[];
  collections?: Collection[];
  pricing?: PricingSection[];
  images: string[];
  productType: ProductTypes;
  recommendations?: RecommendationsInterface;
  active: boolean;
  channelSets?: ChannelSetInterface[];
  variants: VariantsSection[];
  attributes: AttributesSection[];
  shipping: ShippingSection;
  seo: SeoSection;
}

export interface ProductModelSale {
  onSales: boolean,
  salePrice: number,
  saleEndDate: Date,
  saleStartDate: Date,
}

export interface Product extends ProductModel {
  [key: string]: any;
}

export interface PriceTable {
  condition: {
    field: string,
    fieldType: string,
    fieldCondition: string,
    value: any
  },
  currency: string,
  price: number,
  vatRate: number
}

export interface ProductsResponse {
  data: {
    getBusiness?: BusinessInterface,
    getProducts: {
      info: { pagination: Pagination };
      products: Product[];
    };
  };
}
