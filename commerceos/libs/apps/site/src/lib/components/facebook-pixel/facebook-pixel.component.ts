import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

@Component({
  selector: 'peb-facebook-pixel',
  templateUrl: './facebook-pixel.component.html',
  styleUrls: ['./facebook-pixel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsFacebookPixelComponent {

  constructor(

    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) private config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnTitle = 'Save';
    this.config.doneBtnCallback = () => {
      this.overlay.close();
    }
  }
}
