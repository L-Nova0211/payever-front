import {
  ChangeDetectionStrategy,
  Component,
  HostListener, Inject,
} from '@angular/core';

import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

@Component({
  selector: 'pe-pin-dialog',
  templateUrl: './pin-overlay.component.html',
  styleUrls: ['./pin-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PePinOverlayComponent {
  forAll = false;

  constructor(
    private translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
  ) {}

  onConfirm() {
    this.peOverlayData.onCloseSubject$.next(this.forAll);
  }

  onDecline() {
    this.peOverlayData.onCloseSubject$.next(null);
  }

  toggleLabel() {
    return this.peOverlayData.name
      ? this.translateService.translate('pin-overlay.pin_for_chat') + this.peOverlayData.name
      : this.translateService.translate('pin-overlay.pin_for_all');
  }

  @HostListener('keydown.esc')
  public onEsc() {
    this.onDecline();
  }
}
