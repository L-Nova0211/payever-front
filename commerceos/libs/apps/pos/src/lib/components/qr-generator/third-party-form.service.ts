import { HttpClient } from '@angular/common/http';
import { get } from 'js-cookie';
import { Observable } from 'rxjs';

import { InfoBoxSettingsInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { TerminalInterface } from '../../services/pos.types';


export class ThirdPartyInternalFormService {
  constructor(
    private httpClient: HttpClient,
    private translateService: TranslateService,
    private businessId: string,
    private businessName: string,
    private integration: any,
    private terminal: TerminalInterface,
    private qrText: string,
  ) { }

  requestInitialForm(): Observable<{ form: InfoBoxSettingsInterface }> {
    const endpoint = this.integration.extension.formAction.endpoint.split('{businessId}').join(this.businessId);
    const url = this.integration.extension.url + endpoint;

    return this.httpClient.post<{ form: InfoBoxSettingsInterface }>(
      url,
      {
        businessId: this.businessId,
        businessName: this.businessName,
        url: this.qrText,
        id: this.terminal._id,
        avatarUrl: this.terminal.logo,
      },
      {
        headers: {
          authorization: `Bearer ${get('pe_auth_token')}`,
        },
      },
    );
  }

  executeAction(
    action: string,
    data: {},
  ): Observable<{ form: InfoBoxSettingsInterface }> {
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
