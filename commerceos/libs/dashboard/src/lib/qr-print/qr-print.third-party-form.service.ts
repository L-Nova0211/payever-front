import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, of } from 'rxjs';

import { InfoBoxSettingsInFormInterface } from '@pe/forms/third-party-form/interfaces';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeQrPrintFileType, PeQrPrintFormData, PeQrPrintOperation } from './qr-print.interface';
import { QrPrintThirdPartyFormMock } from './qr-print.third-party-form.mock';
import { PE_QR_API_PATH, PE_QR_PRINT_HOST } from './qr-ptint.token';

@Injectable()
export class PeQrPrintThirdPartyFormService {

  private readonly formMock = new QrPrintThirdPartyFormMock(this.peQrApiPath);

  private get url(): string {
    return `${this.peOverlayData?.internalDomain}.${this.peQrPrintHost}`;
  }

  constructor(
    @Optional() @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    @Inject(PE_QR_API_PATH) private peQrApiPath: string,
    @Inject(PE_QR_PRINT_HOST) public peQrPrintHost: string,
  ) { }

  allowCustomActions(): boolean {
    return false;
  }

  allowDownload(): boolean {
    return false;
  }

  public executeAction(
    action: PeQrPrintOperation,
    data: PeQrPrintFormData,
  ): Observable<InfoBoxSettingsInFormInterface> {
    return of(this.formMock.generateQrPrintForm(data, action));
  }

  getActionUrl(action: string): string {
    return null;
  }

  prepareUrl(url: string): string {
    return url;
  }

  public requestInitialForm(): Observable<InfoBoxSettingsInFormInterface> {
    return of(this.formMock.generateQrPrintForm({ type: PeQrPrintFileType.Pdf, url: `https://${this.url}` }));
  }
}
