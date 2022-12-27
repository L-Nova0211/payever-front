import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

export enum ThemeTypeEnum {
  Template = 'template',
  Application = 'application',
}

@Injectable()
export class ApiBuilderService {
  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  getWidgetProducts(_: string): Observable<string[]> {
    return of([]); // REQUEST IS DEPRECATED
  }

  updateWidgetProducts(products: string[], businessUuid: string): Observable<any> {
    return this.http.put(this.getBuilderProductsUrl(businessUuid), products).pipe(
      // tslint:disable-next-line no-unnecessary-callback-wrapper
      catchError((error: HttpErrorResponse) => throwError(error)),
    );
  }

  patchWidgetProducts(productId: string, businessUuid: string): Observable<any> {
    return this.http.patch(this.getBuilderProductsUrl(businessUuid), { productId }).pipe(
      // tslint:disable-next-line no-unnecessary-callback-wrapper
      catchError((error: HttpErrorResponse) => throwError(error)),
    );
  }

  private getThemeEndpoint(themeType: ThemeTypeEnum, businessUuid: string): string {
    let themeEndpointBase: string;

    switch (themeType) {
      case ThemeTypeEnum.Template:
        themeEndpointBase = 'template';
        break;
      case ThemeTypeEnum.Application:
        themeEndpointBase = `business/${businessUuid}/application`;
        break;
      default:
        themeEndpointBase = `business/${businessUuid}/theme`;
        break;
    }

    return themeEndpointBase;
  }

  private getBuilderProductsUrl(businessUuid: string) {
    const themeType: ThemeTypeEnum = this.activatedRoute.snapshot.queryParams.themeEndpoint;
    const themeId: string = this.activatedRoute.snapshot.queryParams.appId;
    const widgetId: string = this.activatedRoute.snapshot.queryParams.widgetId;

    const envBuilder: string = this.env.backend.builder;
    const url = `${envBuilder}/api/${this.getThemeEndpoint(
      themeType,
      businessUuid,
    )}/${themeId}/widgets/${widgetId}/productIds`;

    return url;
  }
}
