import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, pluck, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

import { Product } from './interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(
    private http: HttpClient,
    public envService: EnvService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  getProductListByListOfId(listOfId: string[]): Observable<Product[]> {
    return this.getFolderDocuments(null, {
      page: 1,
      perPage: 40,
    }).pipe(
      map((res: { collection: Product[] }) => {
        return res.collection.filter(product => listOfId.includes(product._id));
      }),
    );
  }

  getProductsByIds(filterById: string[]) {
    if (!filterById || filterById.length == 0) {
      return of([]);
    }

    const businessId = this.envService.businessId;

    const query: any = `
      query {
        getProducts (
          businessUuid: "${businessId}",
          paginationLimit: 100,
          pageNumber: 1,
          orderBy: "title",
          orderDirection: "desc",
          includeIds: ${JSON.stringify(filterById)}
        ) {
          products {
            images
            imagesUrl
            id
            title
            price
            currency
            stock
            sku
            company
          }
          info {
            pagination {
              page
              page_count
              per_page
              item_count
            }
          }
        }
      }
    `;

    return this.http
      .post(this.env.backend.products + '/products', { query })
      .pipe(pluck('data', 'getProducts', 'products'));
  }

  filterProductsByName(filter: string): Observable<Product[]> {
    const businessId = this.envService.businessId;
    const pagination = {
      page: 1,
      perPage: 20,
    };
    const query = `
      query {
        getProducts (
          businessUuid: "${businessId}",
          paginationLimit: ${pagination.perPage},
          pageNumber: ${pagination.page},
          orderBy: "title",
          orderDirection: "desc",
          search: "${filter || ''}",
        ) {
          products {
            images
            imagesUrl
            id
            title
            price
            currency
            stock
            sku
            company
          }
        }
      }   
    `;
    return this.http
      .post<{
        data: {
          getProducts: {
            products: Product[];
          };
        };
      }>(this.env.backend.products + '/products', { query })
      .pipe(map(res => res.data.getProducts.products));
  }

  getFolderDocuments(folderId: string, searchData: any) {
    let path = `${this.env.backend.products}/folders/business/${this.envService.businessId}/root-documents`;
    if (folderId) {
      path = `${this.env.backend.products}/folders/business/${this.envService.businessId}/folder/${folderId}/documents`;
    }

    return this.http.get<any>(path, { params: this.getSearchParams(searchData) });
  }

  private getSearchParams(searchData: any): HttpParams {
    let params = new HttpParams()
      .set('limit', searchData.perPage ? `${searchData.perPage}` : '10')
      .set('page', searchData.page ? `${searchData.page}` : '1')
      .set('orderBy', 'updatedAt')
      .set('direction', 'desc')
      .set('filters[isHeadline][0][condition]', 'isNot')
      .set('filters[isHeadline][0][value][0]', 'true');

    if (searchData.filter) {
      params = params
        .set('filters[name][0][condition]', 'contains')
        .set('filters[name][0][value][0]', searchData.filter);
    }

    return params;
  }
}
