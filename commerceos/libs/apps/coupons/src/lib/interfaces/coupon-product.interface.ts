export class PeCouponProductInterface {
  _id: string;
  businessUuid?: string;
  images?: string[];
  imagesUrls?: string[];
  onSales?: boolean;
  variants?: PeCouponProductInterface;
  price?: number;
  salePrice?: number;
  sku?: string;
  title?: string;
}
