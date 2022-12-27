import { PeProductTypeCustomerEligibilityEnum } from '../../products-list/enums/customer.enum';
import { ProductTypes } from '../enums/product.enum';
import { RecommendationTagsEnum } from '../enums/recommendation-tags.enum';

import { ChannelSetInterface } from './channel-set.interface';
import { RecommendationsItem } from './recommendations.interface';

export const mimeTypes = 'png|jpg|jpeg|bmp';

export interface BaseSection {
  images?: string[];
  price: number;
  salePrice: number;
  onSales: boolean;
  available: boolean;
  productType: ProductTypes;
  saleStartDate?: Date;
  saleEndDate?: Date;
}

export interface MainSection extends BaseSection {
  title: string;
}

export interface ContentSection {
  description: string;
}

export interface PricingSection {
  price: number;
  salePrice: number;
  customerEligibility: PeProductTypeCustomerEligibilityEnum,
  customerEligibilityCustomerGroups: CustomerEligibilityCustomerGroups[],
  customerEligibilitySpecificCustomers: CustomerEligibilitySpecificCustomers[],
}

export interface CustomerEligibilityCustomerGroups {
  id: string;
  businessId?: string;
  isDefault?: boolean;
  name?: string;
}

export interface CustomerEligibilitySpecificCustomers {
  id: string
  businessId?: string;
  type?: string;
}

export interface ContactsFolderInterface {
  _id: string;
  image: string;
  name: string;
}

export interface InventorySection {
  sku: string;
  barcode: string;
  inventory: number;
  lowInventory?: number;
  emailLowStock?: boolean;
  inventoryTrackingEnabled: boolean;
}

export interface NewInventoryInterface {
  sku: string;
  barcode: string;
  isTrackable?: boolean;
  isNegativeStockAllowed?: boolean;
  stock: number;
  lowStock: number;
  emailLowStock: boolean;
}

export interface UpdateInventoryInterface {
  sku: string;
  barcode: string;
  isTrackable?: boolean;
  lowStock: number;
  emailLowStock: boolean;
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

export interface RecommendationsSection {
  allowRecommendations: boolean;
  recommendationTag: RecommendationTagsEnum;
  currentRecommendations: RecommendationsItem[];
}

export interface TaxesSection {
  vatRate: number;
}

export interface VisibilitySection {
  active: boolean;
}

export interface SaleData {
  onSales?: boolean;
  salePrice?: number;
  saleEndDate?: string;
  saleStartDate?: string;
}

export interface VariantsSection extends BaseSection, InventorySection, ContentSection {
  options: OptionsSection[];
  id: string;
  sale?: SaleData
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

export interface SeoSection {
  title: string;
  description: string;
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
  readonly lowStock: number;
  readonly emailLowStock: boolean;
  readonly reserved: number;
  readonly isTrackable: boolean;
  readonly isNegativeStockAllowed: boolean;
}
