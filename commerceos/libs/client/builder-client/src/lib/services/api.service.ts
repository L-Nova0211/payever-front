import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebScreen, PebStylesheet } from '@pe/builder-core';
import { AppType, APP_TYPE, PE_ENV } from '@pe/common';

@Injectable()
export class PebClientApiService {

  constructor(
    private httpClient: HttpClient,

    @Inject(APP_TYPE) private appType: AppType,
    @Inject(PE_ENV) private env: any,
  ) { }

  private get appPath(): string {
    const appPath = this.appType === AppType.Subscriptions ? 'billingSubscription' : this.appType;

    return `${this.env.backend[appPath]}/api`;
  }

  getAppSource(appId: string): Observable<any> {
    return this.httpClient.get(`${this.appPath}/${this.appType}/${appId}/theme`);
  }

  getAppSourcePage(
    appId: string,
    pageId: string,
    variant: string,
    screen?: PebScreen | string,
    password?: string,
  ): Observable<any> {
    const params: { [key: string]: string | string[] } = { };
    if (variant != null) {
      params.variant = variant;
    }
    if (screen != null) {
      params.screen = screen;
    }
    if (password) {
      params.password = password;
    }
    return this.httpClient.get(
      `${this.appPath}/${this.appType}/${appId}/theme/page${pageId ? `/${pageId}` : ''}`,
      { params },
    );
  }

  getAppSourcePageScreenStylesheet(
    appId: string,
    pageId: string,
    screen: PebScreen | string,
  ): Observable<PebStylesheet> {
    return this.httpClient.get<PebStylesheet>(`${this.appPath}/${this.appType}/${appId}/theme/page/${pageId}/stylesheet/${screen}`);
  }

  initiateContactSync(app: any): Observable<any> {
    return this.httpClient.get(`${this.appPath}/business/${app.businessId}/customer/contact`);
  }

  getCustomer(): Observable<any> {
    return this.httpClient.get(`${this.appPath}/customer`);
  }

  login(businessId: string, email: string, password: string): Observable<any> {
    return this.httpClient.post(`${this.appPath}/customer/integration/login`, {
      business: businessId,
      data: { email, password },
    });
  }
}
