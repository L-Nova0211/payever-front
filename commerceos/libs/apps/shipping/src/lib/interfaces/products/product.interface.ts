import { Category } from './category.interface';
import { ChannelSetInterface } from './channel-set.interface';
import { Collection } from './collection.interface';
import { Pagination } from './pagination.interface';
import { ProductTypes } from './product.enum';
import { RecommendationsInterface } from './recommendations.interface';
import { ShippingSection, VariantsSection } from './section.interface';

export interface ProductStockInfo {
  stock: number;
  isTrackable: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  image: string;
  sku: string;
}

export interface FormProductItem {
  id: string;
  name: string;
  image: string;
  label: string;
  productId: string;
}

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
  salePrice: number;
  categories?: Category[];
  collections?: Collection[];
  images: string[];
  productType: ProductTypes;
  recommendations?: RecommendationsInterface;
  active: boolean;
  channelSets?: ChannelSetInterface[];
  variants: VariantsSection[];
  shipping: ShippingSection;
}

export interface Product extends ProductModel {
  [key: string]: any;
}

export interface ProductsResponse {
  data: {
    getProducts: {
      info: { pagination: Pagination };
      products: Product[];
    };
  };
}
