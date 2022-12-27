import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Filter } from '../interfaces/filter.interface';
import { Product } from '../interfaces/product.interface';

import { ProductsApiService } from './api.service';

@Injectable()
export class CollectionsDataService {
  isAddingProductsToCollectionProcess$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  productIdForDeleteFromCollection: string;
  collectionId: string;

  constructor(private api: ProductsApiService) {}

  deleteProductFromCollection(businessId: string): Observable<any> {
    const filters: Filter[] = [
      {
        key: 'collection',
        condition: 'is',
        value: this.collectionId,
      },
    ];

    return this.api.getProducts(businessId, filters).pipe(
      map((products) => {
        products = products.data.getProducts.products;

        return products.filter((product: Product) =>
          product.collections.some(collection => collection._id === this.collectionId),
        );
      }),
      switchMap((products: Product[]) => {
        const product: Product = products.find(p => p.id === this.productIdForDeleteFromCollection);
        product.collections = product.collections.filter(collection => collection._id !== this.collectionId);

        return this.api.createProduct(product, businessId);
      }),
    );
  }
}
