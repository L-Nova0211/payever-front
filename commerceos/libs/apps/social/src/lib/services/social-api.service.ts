import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, pluck, switchMap } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import { PeFilterConditions, PeFilterType, PeGridSortingDirectionEnum, PeGridSortingOrderByEnum } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { CHANNELS_RULES, CHANNELS_COLORS, ICONS } from '../constants';
import { PeSocialIntegrationsEnum, PeSocialRequestsErrorsEnum } from '../enums';
import { PeSocialBusinessIntegrationInterface, PeSocialPostInterface } from '../interfaces';
import { PE_PRODUCTS_API_PATH, PE_SOCIAL_API_PATH } from '../tokens';

import { PeSocialEnvService } from './social-env.service';

@Injectable()
export class PeSocialApiService {

  constructor(
    private apmService: ApmService,
    private httpClient: HttpClient,

    private envService: EnvService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,

    @Inject(PE_PRODUCTS_API_PATH) private peProductsApiPath: string,
    @Inject(PE_SOCIAL_API_PATH) private peSocialApiPath: string,
    private peSocialEnvService: PeSocialEnvService,
  ) { }

  private get businessId(): string {
    return this.envService.businessId;
  }

  private get productsPath(): string {
    return `${this.peProductsApiPath}/folders/business/${this.businessId}`;
  }

  private get socialPath(): string {
    return `${this.peSocialApiPath}/api/business/${this.businessId}`;
  }

  // requests for Post
  public getSocialPosts(): Observable<any> {
    return this.httpClient
      .get(`${this.socialPath}/post`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.GetPosts, error, true)

          return [];
        }));
  }

  public getSocialPost(postId: string): Observable<any> {
    return this.httpClient
      .get(`${this.socialPath}/post/${postId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.GetPost, error, true)

          return throwError(error);
        }));
  }

  public createPostOfProduct(postTemplate: PeSocialPostInterface): Observable<any> {
    const formData = new FormData();
    const params = { post: JSON.stringify(postTemplate) };

    return this.httpClient
      .post(`${this.socialPath}/post/media-post`, formData, { params })
      .pipe(
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.CreatePost, error, true)

          return throwError(error);
        }));
  }

  public createPostOfMedia(postTemplate: PeSocialPostInterface): Observable<any> {
    const formData = new FormData();
    postTemplate.media.forEach(file => {
      formData.append('file', file);
    });
    delete postTemplate.media;
    const params = { post: JSON.stringify(postTemplate) };

    return this.httpClient
      .post(`${this.socialPath}/post/media-post`, formData, { params })
      .pipe(
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.CreatePost, error, true)

          return throwError(error);
        }));
  }

  public updatePost(postId: string, postTemplate: PeSocialPostInterface): Observable<any> {
    return this.httpClient
      .patch(`${this.socialPath}/post/${postId}`, postTemplate)
      .pipe(
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.UpdatePost, error, true)

          return throwError(error);
        }));
  }

  public deleteSocialPost(postId: string): Observable<any> {
    return this.httpClient
      .delete(`${this.socialPath}/post/${postId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.DeletePost, error, true)

          return throwError(error);
        }));
  }

  // requests for Business Integration Subscriptions
  public getSocialBusinessIntegrationSubscriptions(): Observable<any> {
    return this.httpClient
      .get(`${this.socialPath}/integration-subscriptions`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.GetBusinessIntegrations, error, true)

          return [];
        }));
  }

  public putSocialBusinessIntegrationSubscriptionsSwitch(subscriptionId: string, switcher: boolean): Observable<any> {
    const path = `${this.socialPath}/integration-subscriptions/${subscriptionId}/switch-${switcher ? 'on' : 'off'}`;
    return this.httpClient
      .put(path, subscriptionId)
      .pipe(
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.SwitchIntegration, error, true)

          return throwError(error);
        }));
  }

  // requests for Channel Set
  public getSocialChannelSet(): Observable<any> {
    return this.httpClient
      .get<any>(`${this.socialPath}/channel-rules`)
      .pipe(
        switchMap(channelsSet => forkJoin([
          of(this.peSocialEnvService.getChannelsSet(channelsSet)),
          this.getSocialBusinessIntegrationSubscriptions(),
        ])),
        map(([channelsSet, { integrationSubscriptions }]) => {
          const availableIntegrationsList = PeSocialIntegrationsEnum as Object;
          const availableIntegrationsTitles = Object.keys(availableIntegrationsList);
          const availableIntegrationsNames = Object.values(availableIntegrationsList);
          const businessIntegrations = integrationSubscriptions
            .filter(({ integration }) => availableIntegrationsNames
              .some(availableIntegrationName => availableIntegrationName === integration.name));
          const mappedBI = this.peSocialEnvService
            .getBusinessIntegrations(businessIntegrations)
            .map((integration): PeSocialBusinessIntegrationInterface => {
              const BIkey = availableIntegrationsTitles
                .find(key => integration.name.includes(key.toLowerCase())).toLowerCase();
              const channelSet = channelsSet.find(channel => channel.name === integration.channelName);

              return {
                ...integration,
                channelId: channelSet?.id ?? null,
                channelName: channelSet?.name ?? null,
                icon: ICONS[BIkey],
                iconColor: CHANNELS_COLORS[BIkey],
                maxlength: channelSet?.maxlength ?? 2000,
                mediaRules: CHANNELS_RULES[BIkey],
                title: BIkey,
              };
            });
          this.peSocialEnvService.businessIntegrations = mappedBI;

          return mappedBI;
        }),
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.GetChannelsSets, error, true);

          return [];
        }));
  }

  public getProducts(filter?: string | string[]): Observable<any> {
    const condition = PeFilterConditions.Contains;
    const isSearchByTitle = typeof filter === 'string';
    const filters = isSearchByTitle
      ? {
          title: {
            condition,
            value: '*' + (filter as string).toLowerCase(),
          },
        }
      : {
          serviceEntityId: {
            condition,
            value: filter,
          },
        };
    const filterConfiguration = {
      all: 0,
      currency: PeFilterType.String,
      direction: PeGridSortingDirectionEnum.Descending,
      filters,
      limit: isSearchByTitle ? 20 : filter.length,
      orderBy: PeGridSortingOrderByEnum.Name,
      page: 1,
      sort: [PeGridSortingDirectionEnum.Descending],
    };

    return this.httpClient
      .post(`${this.productsPath}/search`, filterConfiguration)
      .pipe(
        pluck('collection'),
        map((products: any) => products
          .map(product => {
            return {
              _id: product.serviceEntityId,
              currency: product.currency,
              image: product?.imagesUrl[0] ?? 'assets/icons/folder-grid.png', //'bag';
              images: product?.imagesUrl ?? [],
              price: product.price,
              title: product.title,
            };
          })
        ),
        catchError(error => {
          this.errorHandler(PeSocialRequestsErrorsEnum.GetProducts, error, true);

          return [];
        }));
  }

  private errorHandler(description: PeSocialRequestsErrorsEnum, error: any, showWarning = false): void {
    const errorDescription = this.translateService.translate(description);

    if (showWarning) {
      this.snackbarService.toggle(true, {
        content: errorDescription,
        duration: 15000,
        iconColor: '#E2BB0B',
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
    }
    this.apmService.apm.captureError(`${errorDescription} ms:\n${JSON.stringify(error)}`);
  }
}
