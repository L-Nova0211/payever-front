import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { PeQrPrintThirdPartyFormService } from './qr-print.third-party-form.service';

@Component({
  selector: 'peb-qr-print',
  templateUrl: './qr-print.component.html',
  styleUrls: ['./qr-print.component.scss', './modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeQrPrintThirdPartyFormService,
  ],
})
export class PeQrPrintComponent {

  constructor(
    public qrPrintThirdPartyFormService: PeQrPrintThirdPartyFormService,
  ) { }
}
