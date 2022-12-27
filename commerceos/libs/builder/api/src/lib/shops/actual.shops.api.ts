import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { omit } from 'lodash';
import { Observable } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';

import { PebShopAccessConfig, PebShopsApi, PebSingleShop, ShopPreviewDTO } from './abstract.shops.api';

export const PEB_SHOPS_API_PATH = new InjectionToken<string>('PEB_SHOPS_API_PATH');

@Injectable()
export class PebActualShopsApi implements PebShopsApi {

  constructor(
    @Inject(PEB_SHOPS_API_PATH) private shopApiPath: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) { }

  private get businessId() {
    return this.envService.businessId;
  }

  getShopsList(isDefault?: boolean): Observable<any[]> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop`;

    return this.http.get<any[]>(endpoint, {
      params: isDefault ? { isDefault: JSON.stringify(isDefault) } : null,
    });
  }

  getSingleShop(shopId: string): Observable<PebSingleShop> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop/${shopId}`;

    return this.http.get<any>(endpoint);

  }

  createShop(payload: any): Observable<any> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop`;

    return this.http.post<any[]>(endpoint, payload);
  }

  validateShopName(name: string): Observable<any> {
    const endpoint = `${this.shopApiPath}/business/${this.envService.businessId}/shop/isValidName?name=${name}`;

    return this.http.get(endpoint);
  }

  deleteShop(shopId: string): Observable<null> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop/${shopId}`;

    return this.http.delete<null>(endpoint);
  }

  updateShop(payload: any): Observable<any> {
    const shopId = payload.id;
    const body = omit(payload, ['id']);
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop/${shopId}`;

    return this.http.patch<any>(endpoint, body);
  }

  markShopAsDefault(shopId: string): Observable<any> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop/${shopId}/default`;

    return this.http.put<any>(endpoint, {});
  }

  getDefaultShop(): Observable<any> {
    return this.http.get<any>(`${this.shopApiPath}/business/${this.businessId}/shop/default`);
  }

  updateShopAccessConfig(shopId: string, payload: Partial<PebShopAccessConfig>): Observable<PebShopAccessConfig> {
    return this.http.patch<PebShopAccessConfig>(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/access/${shopId}`,
      payload,
    );
  }

  getShopPreview(shopId: string, include?: string[]): Observable<ShopPreviewDTO> {
    const endpoint = `${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}/preview`;

    return this.http.get<ShopPreviewDTO>(endpoint, { params: { page: 'front' } });
  }

  checkIsLive(shopId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/access/${shopId}/is-live`,
    );
  }

  patchIsLive(shopId: string, isLive: boolean): Observable<null> {
    return this.http.patch<null>(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/access/${shopId}`,
      { isLive },
    );
  }

  /* DOMAINS */

  getAllDomains(shopId: string): Observable<any> {
    return this.http.get(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}/domain`,
    );
  }

  addSocialImage(accessId: string, image: string) {
    return this.http.patch(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/access/${accessId}`,
      { socialImage: image },
    );
  }

  addDomain(shopId: string, domain: string): Observable<any> {
    return this.http.post(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}/domain`,
      { name: domain },
    );
  }

  checkDomain(shopId: string, domainId: string): Observable<any> {
    return this.http.post(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}/domain/${domainId}/check`,
      {},
    );
  }

  patchDomain(shopId: string, domainId: string, domain: string): Observable<any> {
    return this.http.patch(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}/domain/${domainId}`,
      { name: domain },
    );
  }

  deleteDomain(shopId: string, domainId: string): Observable<any> {
    return this.http.delete(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}/domain/${domainId}`,
    );
  }

  /* ------ */

}
