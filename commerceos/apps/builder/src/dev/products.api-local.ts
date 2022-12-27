import { Inject, Injectable } from '@angular/core';
import { of } from 'rxjs';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';

import { ImitateHttp } from './imitate-http.decorator';

export const SANDBOX_PRODUCT_CATEGORIES = [
  {
    id: '5d0c8df07ac72d002a50d90e',
    title: 'Apple',
  },
  {
    id: '5cc31516a04db100139f40d4',
    title: 'Basheer',
  },
  {
    id: '5d10f594eba4ba002af91805',
    title: 'Bridge',
  },
  {
    id: '5d10fc70eba4ba002af9180a',
    title: 'Cars',
  },
  {
    id: '5e4d0a35a50caa001b0ce4b9',
    title: 'Clothing',
  },
];

@Injectable({ providedIn: 'root' })
export class SandboxMockProductsBackend {

  constructor(
    @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string,
  ) {
  }

  @ImitateHttp()
  getProductsCategories() {
    return of(SANDBOX_PRODUCT_CATEGORIES);
  }

  @ImitateHttp()
  getProducts(ids?: string[]) {
    return of([
      {
        id: '1',
        images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
        title: 'Sport sneakers',
        price: 1200,
      },
      {
        id: '2',
        images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
        title: 'Sport sneakers',
        price: 1200,
      },
      {
        id: '3',
        images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
        title: 'Sport sneakers',
        price: 1200,
      },
      {
        id: '4',
        images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
        title: 'Sport sneakers',
        price: 1200,
      },
    ].filter(el => !ids || ids.includes(el.id)));
  }

  @ImitateHttp()
  getProductCategoriesByIds(ids?: string[]) {
    return ids.map(id => SANDBOX_PRODUCT_CATEGORIES.find(cat => cat.id === id) ?? SANDBOX_PRODUCT_CATEGORIES[0]);
  }
}
