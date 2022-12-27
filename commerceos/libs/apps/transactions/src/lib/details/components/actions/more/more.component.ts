import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';
import { PE_OVERLAY_DATA, PE_OVERLAY_CONFIG, PeOverlayWidgetService } from '@pe/overlay-widget';

import { ActionTypeUIEnum } from '../../../../shared/enums/action-type.enum';

@Component({
  selector: 'pe-more-actions',
  template: `
    <div class="more-actions" [ngClass]="theme">
      <peb-form-background>
        <pe-actions-container
          [uiActions]="uiActions"
          [theme]="theme"
          (selected)="onSelected($event)"
          (closed)="onClosed()"
        ></pe-actions-container>
      </peb-form-background>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MoreActionsComponent {
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] :
    AppThemeEnum.default;

  ActionTypeUIEnum: typeof ActionTypeUIEnum = ActionTypeUIEnum;

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private envService: EnvService,
  ) {
    this.config.backBtnCallback = () => this.overlay.close();
    this.config.doneBtnCallback = () => this.overlay.close();
  }

  get uiActions() {
    return this.appData.uiActions;
  }

  onSelected(actionIndex: number): void {
    this.appData.onSelected$.next(actionIndex);
    this.overlay.close();
  }

  onClosed(): void {
    this.overlay.close();
  }
}
