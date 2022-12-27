import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { ScreenTypeStyleComponent } from '../components/screen-type/screen-type.component';
import { ScreenTypeEnum } from '../enums';

@Injectable()
export class ScreenTypeStylesService {
  theme = 'dark';
  dialogRef: PeOverlayRef;

  screen$ = new BehaviorSubject<ScreenTypeEnum>(ScreenTypeEnum.Desktop);

  constructor(
    private overlayService: PeOverlayWidgetService,
    private translateService: TranslateService,
  ) {
  }

  openDialog(): void {
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'settings-modal',
      data: {
        selected: this.screen$.value,
        screen$: this.screen$,
        close: () => this.dialogRef.close(),
      },
      headerConfig: {
        title: this.translateService.translate('settings.colorAndStyle.screen.title'),
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.dialogRef.close();
        },
        doneBtnTitle: this.translateService.translate('actions.done'),
        theme: this.theme,
      },
      component: ScreenTypeStyleComponent,
    };

    this.dialogRef = this.overlayService.open(config);
  }

  isShowScreen(screen: ScreenTypeEnum[]): boolean {
    return !screen
      ? true
      : screen.includes(this.screen$.value);
  }
}
