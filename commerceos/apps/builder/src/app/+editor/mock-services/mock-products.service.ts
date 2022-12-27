import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockProductsService {

  getByIds(ids: string[]): Observable<any> {
    const data: any[] = ids.map((id, index) => ({
      id,
      title: `Product ${index + 1}`,
      image: `/assets/showcase-images/shoes/${index + 1}.png`,
      prices: {
        regular: 39,
        sale: null,
      },
      categories: [],
    }));

    return of({
      state: 'ready',
      data,
    });
  }

}
