import { ChannelSetInterface } from './channel-set.interface';
import { ProductTypes } from './product.enum';
import { RecommendationTagsEnum } from './recommendation-tags.enum';
import { RecommendationsItem } from './recommendations.interface';

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

export interface NewInventoryInterface {
  sku: string;
  barcode: string;
  isTrackable?: boolean;
  isNegativeStockAllowed?: boolean;
  stock: number;
}

export interface UpdateInventoryInterface {
  sku: string;
  barcode: string;
  isTrackable?: boolean;
  isNegativeStockAllowed?: boolean;
}

export interface VatRateInterface {
  description: string;
  rate: number | string;
}

export interface CategorySection {
  categories: (Category | NotFullCategory)[];
}

export interface ChannelsSection extends ChannelSetInterface {
  [key: string]: any;
}

export interface RecommendationsSection {
  allowRecommendations: boolean;
  recommendationTag: RecommendationTagsEnum;
  currentRecommendations: Array<RecommendationsItem>;
}

export interface TaxesSection {
  vatRate: number;
}

export interface VisibilitySection {
  active: boolean;
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
