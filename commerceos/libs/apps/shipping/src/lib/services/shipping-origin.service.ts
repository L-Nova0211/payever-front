import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { EnvService } from '@pe/common';

import { PEB_SHIPPING_API_PATH } from '../enums/constants';
import { ShippingOriginInterface } from '../interfaces';

@Injectable({ providedIn: 'any' })
export class PebShippingOriginService {
  constructor(
    private http: HttpClient,
    @Inject(PEB_SHIPPING_API_PATH) private shippingApiPath: string,
    private envService: EnvService,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  baseUrl = `${this.shippingApiPath}/business/${this.businessId}/shipping-origin`;

  postOrigin(payload: ShippingOriginInterface) {
    return this.http.post(this.baseUrl, payload);
  }

  getOriginById(originId) {
    return this.http.get(`${this.baseUrl}/${originId}`);
  }

  editOrigin(originId: string, payload) {
    return this.http.put(`${this.baseUrl}/${originId}`, payload);
  }

  deleteOrigin(originId) {
    return this.http.delete(`${this.baseUrl}/${originId}`);
  }
}
