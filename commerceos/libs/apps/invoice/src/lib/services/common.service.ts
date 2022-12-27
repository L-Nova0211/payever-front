import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { PEB_STORAGE_PATH, PEB_PRODUCTS_API_PATH } from '@pe/builder-api';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

import { PEB_INVOICE_API_PATH, PE_CONTACTS_HOST } from '../constants';
import { ProductData } from '../interfaces/filter.interface';

@Injectable()
export class CommonService {

  constructor(
    @Inject(PEB_PRODUCTS_API_PATH) private productsApiPath: string,
    @Inject(PE_CONTACTS_HOST) private contactsApiPath: string,
    @Inject(PEB_INVOICE_API_PATH) private invoiceApiPath: string,
    @Inject(PEB_STORAGE_PATH) private storagePath: string,
    private envService: EnvService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface, private http: HttpClient) {
  }

  getCurrencyList(): Observable<any[]> {

    return this.http.get<any[]>(`${this.env.backend.common}/api/currency/list`);
  }

  getCountryList(): Observable<any[]> {

    return this.http.get<any[]>(`${this.env.backend.common}/api/country/list`);
  }

  getLanguagesList(): Observable<any[]> {

    return this.http.get<any[]>(`${this.env.backend.common}/api/language/list`);
  }

  getProductsList(title: string = '', limit: number = 20, offset: number = 0): Observable<any[]> {
    let params: any = title ? { title } : null;
    params.limit = limit;
    params.offset = offset;

    return this.http.get<any[]>(`${this.invoiceApiPath}/business/${this.envService.businessId}/product`,
      { params: params })
      .pipe(
        map((products: any) => this.mapProductData(products)),
      );
  }

  getProducts(ids?: string[]): Observable<ProductData[]> {

    return this.http.post(`${this.productsApiPath}/products`, {
      query: `{getProducts(
        businessUuid: "${this.envService.businessId}",
        ${ids ? `includeIds: [${ids.map(
        i => `"${i}"`,
      )}]` : ''}
        pageNumber: 1,
        paginationLimit: 100,
        useNewFiltration: false,
      ) {
        products {
          images
          _id
          title
          description
          price
          salePrice
          currency
          active
          categories { id title }
        }
      }}`,
    }).pipe(
      filter((result: any) => !!result?.data?.getProducts?.products),
      map((result: any) => result.data.getProducts.products),
      map((products: any) => this.mapProductData(products)),
    );
  }

  getContacts(filterStr: string = '', limit = 20, offset = 1): Observable<any> {
    const filtersArr = filterStr.split(' ');
    let wildcard = [];
    filtersArr.forEach((str) => {
      wildcard.push({ wildcard: { fullName: { value: `*${str}*` } } })
    })
    const filters = JSON.stringify({ must: wildcard });

    return this.http.get(
      `${this.contactsApiPath}/api/es/list/${this.envService.businessId}`
      +`?filters=${filters}&page=${offset}&limit=${limit}`
      ).pipe(filter((result: any) => !!result?.collection),
      map((result: any) => {
        let contacts = result.collection.map(contact => ({
            id: contact.mongoId,
            business: contact.businessId,
            name: contact.fullName,
            image: contact.image,
            email: contact.email,
          })
        );

        return contacts;
      })
    );
  }

  getContactById(id: string): Observable<any> {

    return this.http.post(`${this.contactsApiPath}/contacts`, {
      query:`{
        contact(
          businessId: "${this.envService.businessId}",
          id: "${id}"
          ) {
          _id
          businessId
          groupsId
          type
          fields {
            _id
            value
            fieldId
            field {
              _id
              name
            }
          }
        }
      }
    ` }).pipe(
      filter((result: any) => !!result?.data?.contact),
      map((result: any) => {
        let contacts = {
          id: result.data.contact._id,
          business: result.data.contact.businessId,
          name: `${result.data.contact.fields.find(item => item.field.name === 'firstName')?.value}
          ${result.data.contact.fields.find(item => item.field.name === 'lastName')?.value}`,
          image: result.data.contact.fields.find(item => item.field.name === 'imageUrl')?.value,
          email: result.data.contact.fields.find(item => item.field.name === 'email')?.value,
        };

        return contacts;
      })
    );;
  }

  mapProductData(products):ProductData[]{

    return products.map((product) => {
      const image = typeof product.images === 'string' ? product.images : product.images?.map(
        i => `${this.storagePath}/products/${i}`,
      ).pop()

      return {
        id: product._id,
        productId:product._id,
        name: product.title,
        description: product?.description,
        price: product.price,
        salePrice: product.salePrice,
        currency: product.currency,
        image: image,
        categories: product.categories || [],
        active: product.active,
        variants: product.variants
          ? product.variants.map(v => ({
            id: v.id,
            title: v.title,
            description: v?.description,
            price: v.price,
            salePrice: v.salePrice,
            options: v.options,
            images: v.images.map(
              i => `${this.storagePath}/products/${i}`,
            ),
          }))
          : null,
      };
    })
  }
}
