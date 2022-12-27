import { ProductStockInfo } from '../interfaces/product.interface';

export const LOW_OF_STOCK_THRESHOLD = 5;

export function convertStock(stockInfo: ProductStockInfo, threshold: number = LOW_OF_STOCK_THRESHOLD): string {
  let stock: string = null;

  if (!stockInfo || !stockInfo.isTrackable) {
    stock = 'in stock';
  } else if (!stockInfo.stock) {
    stock = 'out of stock';
  } else if (stockInfo.stock <= threshold) {
    stock = 'low of stock';
  } else {
    stock = `stock ${stockInfo.stock}`;
  }

  return stock;
}
