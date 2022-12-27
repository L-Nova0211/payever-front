import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';

import { PeAffiliatesRequestsErrorsEnum } from '../enums';
import {
  PeAffiliatesCategoryOfProductsInterface,
  PeAffiliatesNetworkInterface,
  PeAffiliatesProductInterface,
  PeAffiliatesProgramInterface,
} from '../interfaces';
import { PE_AFFILIATES_API_PATH, PE_PRODUCTS_API_PATH } from '../tokens';

import { PeErrorsHandlerService } from './errors-handler.service';

@Injectable()
export class PeAffiliatesApiService {

  constructor(
    private httpClient: HttpClient,

    private pebEnvService: PebEnvService,
    @Inject(PE_AFFILIATES_API_PATH) private peAffiliatesApiPath: string,
    @Inject(PE_PRODUCTS_API_PATH) private peProductsApiPath: string,
    @Inject(PEB_EDITOR_API_PATH) private pebEditorApiPath: string,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get affiliatesPath(): string {
    return `${this.businessPath}/affiliates`;
  }

  private get bankPath(): string {
    return `${this.businessPath}/affiliates-bank`;
  }

  private get businessId(): string {
    return this.pebEnvService.businessId;
  }

  private get businessPath(): string {
    return `${this.peAffiliatesApiPath}/business/${this.businessId}`;
  }

  private get networksPath(): string {
    return `${this.businessPath}/affiliates-branding`;
  }

  private get programsPath(): string {
    return `${this.businessPath}/affiliates-program`;
  }

  // Affiliates bank accounts
  public getBankAccounts(): Observable<any> {
    return this.httpClient
      .get<any>(`${this.bankPath}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetBankAccounts, error);

          return throwError(error);
        }));
  }

  public createBankAccount(bank: any): Observable<any> {
    return this.httpClient
      .post(`${this.bankPath}`, bank)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.CreateBankAccount, error);

          return throwError(error);
        }));
  }

  public deleteBankAccount(bankId: string): Observable<any> {
    return this.httpClient
      .delete(`${this.bankPath}/${bankId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.DeleteBankAccount, error);

          return throwError(error);
        }));
  }

  public updateBankAccount(bankId: string, bank: any): Observable<any> {
    return this.httpClient
      .patch(`${this.bankPath}/${bankId}`, bank)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.UpdateBankAccount, error);

          return throwError(error);
        }));
  }

  // Affiliates sales networks
  public getNetwork(networkId: string): Observable<PeAffiliatesNetworkInterface> {
    return this.httpClient
      .get<PeAffiliatesNetworkInterface>(`${this.networksPath}/${networkId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetSalesNetwork, error);

          return throwError(error);
        }));
  }

  public getNetworks(): Observable<PeAffiliatesNetworkInterface[]> {
    return this.httpClient
      .get<PeAffiliatesNetworkInterface[]>(this.networksPath)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetSalesNetworks, error);

          return throwError(error);
        }));
  }

  public createNetwork(
    network: PeAffiliatesNetworkInterface,
  ): Observable<PeAffiliatesNetworkInterface> {
    return this.httpClient
      .post<PeAffiliatesNetworkInterface>(this.networksPath, network)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.CreateSalesNetwork, error);

          return throwError(error);
        }));
  }

  public deleteNetwork(networkId: string): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.networksPath}/${networkId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.DeleteSalesNetwork, error);

          return throwError(error);
        }));
  }

  public updateNetwork(
    networkId: string,
    network: PeAffiliatesNetworkInterface,
  ): Observable<PeAffiliatesNetworkInterface> {
    return this.httpClient
      .patch<PeAffiliatesNetworkInterface>(`${this.networksPath}/${networkId}`, network)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.UpdateSalesNetwork, error);

          return throwError(error);
        }));
  }

  public getDefaultNetwork(): Observable<PeAffiliatesNetworkInterface> {
    return this.httpClient
      .get<PeAffiliatesNetworkInterface>(`${this.networksPath}/default`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetDefaultSalesNetwork, error);

          return throwError(error);
        }));
  }

  public setNetworkAsDefault(networkId: string): Observable<PeAffiliatesNetworkInterface> {
    return this.httpClient
      .patch<PeAffiliatesNetworkInterface>(
        `${this.networksPath}/${networkId}/default`,
        {},
      )
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.SetDefaultSalesNetwork, error);

          return throwError(error);
        }));
  }

  public validateNetworkName(networkName: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.networksPath}/isValidName?name=${networkName}`)
      .pipe(
        catchError(error => {
          return throwError(error);
        }));
  }

  // Affiliates programs
  public getProgram(affiliateProgramId: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.programsPath}/${affiliateProgramId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetProgram, error);

          return throwError(error);
        }));
  }

  public getAllPrograms(): Observable<PeAffiliatesProgramInterface[]> {
    return this.httpClient
      .get<PeAffiliatesProgramInterface[]>(this.programsPath)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetAllPrograms, error);

          return throwError(error);
        }));
  }

  public getProgramsBySalesNetwork(salesNetworkId: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.programsPath}/branding/${salesNetworkId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetProgramsBySalesNetwork, error);

          return throwError(error);
        }));
  }

  public createProgram(affiliateProgram: PeAffiliatesProgramInterface): Observable<any> {
    return this.httpClient
      .post(this.programsPath, affiliateProgram)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.CreateProgram, error);

          return throwError(error);
        }));
  }

  public deleteProgram(affiliateProgramId: string): Observable<any> {
    return this.httpClient
      .delete(`${this.programsPath}/${affiliateProgramId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.DeleteProgram, error);

          return throwError(error);
        }));
  }

  public updateProgram(affiliateProgramId: string, affiliateProgram: PeAffiliatesProgramInterface): Observable<any> {
    return this.httpClient
      .patch(`${this.programsPath}/${affiliateProgramId}`, affiliateProgram)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.UpdateProgram, error);

          return throwError(error);
        }));
  }

  // Affiliates
  public getAffiliatesList(isDefault?: boolean): Observable<any[]> {
    const params = isDefault
        ? {
            isDefault: JSON.stringify(isDefault),
          }
        : null;

    return this.httpClient
      .get<any[]>(this.affiliatesPath, { params })
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetAffiliatesList, error);

          return throwError(error);
        }));
  }

  public getAffiliatePreview(affiliateId: string, include?: string[]): Observable<any> {
    return this.httpClient
      .get<any>(`${this.affiliatesPath}/${affiliateId}/preview`, { params: { page: 'front' } })
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetAffiliatePreview, error);

          return throwError(error);
        }));
  }

  public createAffiliate(affiliate: any): Observable<any> {
    return this.httpClient
      .post<any[]>(this.affiliatesPath, affiliate)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.CreateAffiliate, error);

          return throwError(error);
        }));
  }

  public deleteAffiliate(affiliateId: string): Observable<null> {
    return this.httpClient
      .delete<null>(`${this.affiliatesPath}/${affiliateId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.DeleteAffiliate, error);

          return throwError(error);
        }));
  }

  public updateAffiliate(affiliate: any): Observable<any> {
    const affiliateId = affiliate.id;
    delete affiliate.id;

    return this.httpClient
      .patch<any>(`${this.affiliatesPath}/${affiliateId}`, affiliate)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.UpdateAffiliate, error);

          return throwError(error);
        }));
  }

  public validateAffiliateName(name: string): Observable<any> {
    return this.httpClient
      .get(`${this.affiliatesPath}/isValidName?name=${name}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.ValidateAffiliateName, error);

          return throwError(error);
        }));
  }

  public getCurrentAffiliatePreview(affiliateId: string, currentDetail?: boolean, diff?: boolean): Observable<any> {
    const { businessId } = this.pebEnvService;
    const endpoint = `${this.pebEditorApiPath}/api/business/${businessId}/application/${affiliateId}/preview`;

    return this.httpClient
      .get<any>(endpoint, { params: { currentDetail: JSON.stringify(currentDetail) } })
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetCurrentAffiliatePreview, error);

          return throwError(error);
        }));
  }

  //Categories
  private categoriesGQL(filterByTitle: string = ''): { query: string } {
    return {
      query: `{
        getCategories (
          businessUuid: "${this.businessId}",
          title: "${filterByTitle}",
        ) {
          _id
          businessUuid
          slug
          title
        }
      }`,
    };
  };

  public getCategories(filter?: string): Observable<PeAffiliatesCategoryOfProductsInterface[]> {
    return this.httpClient
      .post(`${this.peProductsApiPath}/products`, this.categoriesGQL(filter))
      .pipe(
        map((request: any) => request.data.getCategories),
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetCategories, error);

          return throwError(error);
        }));
  }

  // Products
  private productsGQL(filterByTitle: string = ''): { query: string } {
    return { 
      query: `{
        getProducts(
          businessUuid: "${this.businessId}",
          filters: {
            fieldType: "string"
            field: "title"
            value: "${filterByTitle}"
          },
          paginationLimit: 100,
          orderBy: "price",
          orderDirection: "desc",
        ) {
          products {
            _id
            imagesUrl
            title
            price
          }
        }
      }`,
    };
  }

  public getProducts(filter?: string): Observable<PeAffiliatesProductInterface[]> {
    return this.httpClient
      .post(`${this.peProductsApiPath}/products`, this.productsGQL(filter))
      .pipe(
        map((request: any) => request.data.getProducts.products
          .map((product: any): PeAffiliatesProductInterface => {
            return {
              _id: product._id,
              image: product?.imagesUrl[0] ?? 'assets/icons/folder-grid.png', //'bag',
              price: product.price,
              title: product.title,
            };
          })),
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetProducts, error, true);

          return throwError(error);
        }));
  }
}
