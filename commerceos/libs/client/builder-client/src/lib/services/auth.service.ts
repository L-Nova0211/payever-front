import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from "rxjs/operators";

import { AppType, APP_TYPE } from '@pe/common';

import { PebClientApiService } from './api.service';

const accessTokenKey = 'access_token';
const refreshTokenKey = 'refresh_token';

@Injectable({ providedIn: 'platform' })
export class PebClientAuthService {

  private readonly pagePasswordSubject$ = new BehaviorSubject<string>(undefined);
  readonly pagePassword$ = this.pagePasswordSubject$.asObservable();
  get pagePassword() {
    return this.pagePasswordSubject$.getValue();
  }

  set pagePassword(p: string) {
    this.pagePasswordSubject$.next(p);
  }

  get token(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(this.getAccessTokenKey());
  }

  private readonly customerSubject$ = new BehaviorSubject<any>(null);
  readonly customer$ = this.customerSubject$.asObservable();
  get customer() {
    return this.customerSubject$.getValue();
  }

  set customer(v) {
    this.customerSubject$.next(v);
  }

  private get refreshToken(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(this.getRefreshTokenKey());
  }

  constructor(
    private apiService: PebClientApiService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
    @Inject(PLATFORM_ID) private platformId: any,
  ) { }

  authorize({ accessToken, refreshToken }): Promise<any> {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    localStorage.removeItem('visitedShops');

    return this.getCustomer();
  }

  refresh(): Promise<void> {
    throw new Error('refresh is not implemented');
  }

  getCustomer(): Promise<any> {
    return this.token ? this.apiService.getCustomer().pipe(
      tap(customer => this.customer = customer),
    ).toPromise() : Promise.resolve();
  }

  private getAccessTokenKey(): string {
    return `${this.appType}_${accessTokenKey}`;
  }

  private getRefreshTokenKey(): string {
    return `${this.appType}_${refreshTokenKey}`;
  }

  private setAccessToken(accessToken: string): void {
    localStorage.setItem(this.getAccessTokenKey(), accessToken);
  }

  private setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.getRefreshTokenKey(), refreshToken);
  }
}
