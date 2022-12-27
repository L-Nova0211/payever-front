import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { EnvService } from '@pe/common';

import { PEB_SHIPPING_API_PATH } from '../../enums/constants';

@Injectable({ providedIn: 'any' })
export class PebShippingConnectService {
  constructor(
    private http: HttpClient,
    @Inject(PEB_SHIPPING_API_PATH) private shippingApiPath: string,
    private envService: EnvService,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  private baseUrl = `${this.shippingApiPath}/business/${this.businessId}`;

  getShippingMethods() {
    return this.http.get(`${this.baseUrl}`);
  }

  integrationEnable(subsriptionId: string) {
    return this.http.put(`${this.baseUrl}/integration-subscriptions/${subsriptionId}/switch-on`, {});
  }

  integrationDisable(subsriptionId: string) {
    return this.http.put(`${this.baseUrl}/integration-subscriptions/${subsriptionId}/switch-off`, {});
  }
}
