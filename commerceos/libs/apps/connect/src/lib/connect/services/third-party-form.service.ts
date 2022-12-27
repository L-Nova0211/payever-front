import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { forEach } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface as EnvInterface, PE_ENV } from '@pe/common';
import {
  InfoBoxSettingsInterface,
  ThirdPartyFormServiceInterface,
  InfoBoxSettingsInfoBoxTypeInterface,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';

import { AuthTokenInterface, BusinessInterface, IntegrationInfoWithStatusInterface } from '../../shared';

export class ThirdPartyFormService implements ThirdPartyFormServiceInterface {
  apiKeys: AuthTokenInterface[] = null;
  apiKeysEditorEnabled$: Observable<boolean> = null;
  onboardingFormEnabled$: Observable<boolean> = null;
  private apiKeysEditorEnabledSubject = new BehaviorSubject(false);
  private onboardingFormEnabledSubject = new BehaviorSubject(false);

  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    private peAuthService: PeAuthService,
    private httpClient: HttpClient,
    private businessId: string,
    private integration: IntegrationInfoWithStatusInterface,
  ) {
    this.apiKeysEditorEnabled$ = this.apiKeysEditorEnabledSubject.asObservable();
    this.onboardingFormEnabled$ = this.onboardingFormEnabledSubject.asObservable();
  }

  requestInitialForm(): Observable<{ form: InfoBoxSettingsInterface }> {
    return this.runRequest(this.integration.connect.formAction.initEndpoint).pipe(
      map((data) => {
        this.updateSections(data.form as InfoBoxSettingsInfoBoxTypeInterface);

        return data;
      }),
    );
  }

  executeAction(action: string, data: {}): Observable<{ form: InfoBoxSettingsInterface }> {
    return this.runRequest(this.integration.connect.formAction.actionEndpoint, { action: action }, data).pipe(
      map((data) => {
        this.updateSections(data.form as InfoBoxSettingsInfoBoxTypeInterface);

        return data;
      }),
    );
  }

  getActionUrl(action: string): string {
    return this.makeUrl(this.integration.connect.formAction.actionEndpoint, { action: action });
  }

  prepareUrl(url: string): string {
    return url.replace('{redirectUrl}', encodeURIComponent(window.location.href));
  }

  allowCustomActions(): boolean {
    return true;
  }

  allowDownload(): boolean {
    return false;
  }

  setApiKeys(keys: AuthTokenInterface[]): void {
    this.apiKeys = keys;
  }

  private makeUrl(endpoint: string, replace: {} = {}): string {
    endpoint = endpoint.replace('{businessId}', this.businessId);
    forEach(replace, (value: string, key: string) => (endpoint = endpoint.replace(`{${key}}`, value)));

    return `${this.integration.connect.url}${endpoint}`;
  }

  private runRequest(
    endpoint: string,
    replace: {} = {},
    data: {} = {},
  ): Observable<{ form: InfoBoxSettingsInterface }> {
    const token = this.peAuthService.token;

    if (this.integration.connect.sendApiKeys) {
      data['apiKeys'] = this.apiKeys || [];
    }

    return this.httpClient.post<{ form: InfoBoxSettingsInterface }>(this.makeUrl(endpoint, replace), data, {
      headers: { authorization: `Bearer ${token}` },
    });
  }

  private updateSections(data: InfoBoxSettingsInfoBoxTypeInterface): void {
    this.apiKeysEditorEnabledSubject.next(!!data?.apiKeysEditorEnabled);
    this.onboardingFormEnabledSubject.next(!!data?.onboardingFormEnabled);
  }
}

export class ThirdPartyInternalFormService implements ThirdPartyFormServiceInterface {
  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    private httpClient: HttpClient,
    private mediaService: MediaService,
    private translateService: TranslateService,
    private business: BusinessInterface,
    private integration: IntegrationInfoWithStatusInterface,
  ) {}

  requestInitialForm(): Observable<{ form: InfoBoxSettingsInterface }> {
    const endpoint = this.integration.extension.formAction.endpoint.split('{businessId}').join(this.business._id);
    const url = this.integration.extension.url + endpoint;
    let data = {};
    if (this.integration.name === 'qr') {
      data = {
        url: 'https://commerceos.payever.org/', // TODO Not good. Hardcode should be removed.
        businessName: this.business.name,
        avatarUrl: this.mediaService.getMediaUrl(this.business.logo, 'images'),
        businessId: this.business._id,
        // payeverLogo: true,
        // wording: this.translateService.translate('qr.previewImageTitle')
      };
    }

    return this.httpClient.request<{ form: InfoBoxSettingsInterface }>(
      this.integration.extension.formAction.method || 'POST',
      url,
      { body: data },
    );
  }

  executeAction(action: string, data: {}): Observable<{ form: InfoBoxSettingsInterface }> {
    return null;
  }

  getActionUrl(action: string): string {
    return null;
  }

  prepareUrl(url: string): string {
    return url;
  }

  allowCustomActions(): boolean {
    return true;
  }

  allowDownload(): boolean {
    return true;
  }
}

export class OldThirdPartyFormService implements ThirdPartyFormServiceInterface {
  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    private httpClient: HttpClient,
    private businessId: string,
    private integration: IntegrationInfoWithStatusInterface,
  ) {}

  get domain(): string {
    return this.envConfig.thirdParty.communications;
  }

  requestInitialForm(): Observable<{ form: InfoBoxSettingsInterface }> {
    return this.httpClient.post<{ form: InfoBoxSettingsInterface }>(
      `${this.domain}/api/business/${this.businessId}/integration/${this.integration.name}/form`,
      {},
    );
  }

  executeAction(action: string, data: {}): Observable<{ form: InfoBoxSettingsInterface }> {
    return this.httpClient.post<{ form: InfoBoxSettingsInterface }>(this.getActionUrl(action), data);
  }

  getActionUrl(action: string): string {
    return `${this.domain}/api/business/${this.businessId}/integration/${this.integration.name}/action/${action}`;
  }

  prepareUrl(url: string): string {
    return url;
  }

  allowCustomActions(): boolean {
    return false;
  }

  allowDownload(): boolean {
    return false;
  }
}
