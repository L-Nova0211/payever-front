import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import { InfoBoxSettingsInterface, ThirdPartyFormServiceInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';

import { CheckoutInterface, IntegrationConnectInfoInterface } from '../../interfaces';

export class ThirdPartyInternalFormService implements ThirdPartyFormServiceInterface {
  constructor(
    private env: EnvInterface,
    private mediaService: MediaService,
    private httpClient: HttpClient,
    private translateService: TranslateService,
    private businessId: string,
    private businessName: string,
    private integration: IntegrationConnectInfoInterface,
    private checkout: CheckoutInterface,
    private qrText: string
  ) {}

  requestInitialForm(): Observable<{form: InfoBoxSettingsInterface}> {
    const endpoint = this.integration.extension.formAction.endpoint.split('{businessId}').join(this.businessId);
    const url = this.integration.extension.url + endpoint;
    const action = 'POST';

    return this.httpClient.request<{form: InfoBoxSettingsInterface}>(action, url, {
      body: {
        businessId: this.businessId,
        businessName: this.businessName,
        url: this.qrText,
        id: this.checkout._id,
        avatarUrl: this.mediaService.getMediaUrl(this.checkout.logo, 'images'),
      },
    });
  }

  executeAction(action: string, data: {}): Observable<{form: InfoBoxSettingsInterface}> {
    return null;
  }

  getActionUrl(action: string): string {
    return null;
  }

  allowCustomActions(): boolean {
    return true;
  }

  prepareUrl(url: string): string {
    return url;
  }

  allowDownload(): boolean {
    return true;
  }
}
