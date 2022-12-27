import { Filter } from './filter.interface';
import { Pagination } from './pagination.interface';
import { Product } from './product.interface';

export namespace Responses {
  export interface Empty {
    [propName: string]: any;
  }

  export interface GetStoreItems {
    pagination: Pagination;
    collection: Product[];
    filters: Filter[];
  }
}
