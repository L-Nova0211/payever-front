import { ProductTypes } from '../enums/product.enum';

import { ChannelSetInterface } from './channel-set.interface';

export const mimeTypes = 'png|jpg|jpeg|bmp';

export interface BaseSection {
  images?: string[];
  price: number;
  salePrice: number;
  onSales: boolean;
  available: boolean;
  productType: ProductTypes;
}

export interface MainSection extends BaseSection {
  title: string;
}

export interface ContentSection {
  description: string;
}

export interface InventorySection {
  sku: string;
  barcode: string;
  inventory: number;
  inventoryTrackingEnabled: boolean;
}

export interface UpdateInventoryInterface {
  sku: string;
  barcode: string;
  isTrackable?: boolean;
  isNegativeStockAllowed?: boolean;
}

export interface VatRateInterface {
  description: string;
  rate: number;
}

export interface CategorySection {
  categories: Array<Category | NotFullCategory>; // after click Save will come as Category
}

export interface ChannelsSection extends ChannelSetInterface {
  [key: string]: any;
}

export interface VariantsSection extends BaseSection, InventorySection, ContentSection {
  options: OptionsSection[];
  id: string;
}

export interface OptionsSectionGrouped {
  name: string;
  value: string[];
  type: VariantOptionSectionType;
}

interface VariantsBaseForm {
  type: 'edit' | 'create';
}

export interface VariantsEditFormData extends VariantsSection, VariantsBaseForm {
  type: 'edit';
}

export interface VariantsCreateFormData extends Omit<VariantsSection, 'options'>, VariantsBaseForm {
  type: 'create';
  options: OptionsSectionGrouped[];
}

export enum VariantOptionSectionType {
  DEFAULT = 'DEFAULT',
  COLOR = 'COLOR',
  NUMERIC = 'NUMERIC',
  SIZE = 'SIZE',
}

export interface OptionsSection {
  name: string;
  value: string;
  type: VariantOptionSectionType;
}

export interface ShippingSection {
  weight: string;
  width: string;
  length: string;
  height: string;
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  businessUuid: string;
}

export interface NotFullCategory {
  title: string;
}

export interface ExternalError {
  section: string;
  field: MainSection | InventorySection | string;
  errorText: string;
}

export enum AttributeTypesEnum {
  text = 'text',
  numeric = 'numeric',
  color = 'color',
}

export interface AttributesSection {
  type: AttributeTypesEnum;
  name: string;
  value: string;
}

export interface InventoryInterface {
  readonly product: string;
  readonly business: string;
  readonly sku: string;
  readonly barcode: string;
  readonly stock: number;
  readonly reserved: number;
  readonly isTrackable: boolean;
  readonly isNegativeStockAllowed: boolean;
}
