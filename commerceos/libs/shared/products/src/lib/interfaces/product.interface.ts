import { ProductTypes } from '../enums/product.enum';

import { ChannelSetInterface } from './channel-set.interface';
import { Collection } from './collection.interface';
import { RecommendationsInterface } from './recommendations.interface';
import { AttributesSection, ShippingSection, VariantsSection, Category } from './section.interface';

export interface ProductInventoryInterface {
  sku: string;
  inventory: number;
  inventoryTrackingEnabled: boolean;
  barcode: string;
}
export interface ProductModel extends ProductInventoryInterface {
  [key: string]: any;
  id?: string;
  title: string;
  description: string;
  onSales: boolean;
  available: boolean;
  price: number;
  company?: string;
  salePrice: number;
  categories?: Category[];
  collections?: Collection[];
  images: string[];
  productType: ProductTypes;
  recommendations?: RecommendationsInterface;
  active: boolean;
  channelSets?: ChannelSetInterface[];
  variants: VariantsSection[];
  attributes: AttributesSection[];
  shipping: ShippingSection;
}

export interface Product extends ProductModel {
  [key: string]: any;
}
