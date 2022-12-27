import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, MessageBus } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { AbstractComponent } from '../components/abstract';

@Injectable()
export class InfoBoxService extends AbstractComponent {
  dialogRef: PeOverlayRef;
  isCloseSettings = false;
  theme = AppThemeEnum.default;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();
  constructor(
    private translateService: TranslateService,
    private messageBus: MessageBus,
    private overlayService: PeOverlayWidgetService,
    private confirmScreenService: ConfirmScreenService
  ) {
    super();
  }

  openModal(data, theme, updateMethod, closeDialog = () => {}) {
    const config: PeOverlayConfig = {
      data: { data: data.data, theme },
      headerConfig: {
        title: data.name,
        backBtnTitle: this.translateService.translate('dialogs.new_employee.buttons.cancel'),
        backBtnCallback: () => {
          this.showConfirmationDialog();
        },
        doneBtnTitle: this.translateService.translate('actions.save'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme,
      },
      backdropClick: () => {
        this.showConfirmationDialog();
      },
      component: data.component,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        tap((res) => {
          if (res) {
            updateMethod(res.data);
          }
          closeDialog();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  getObjectForModal(detail, component, data = null) {
    return {
      component,
      data,
      name: detail.itemName,
    };
  }

  showConfirmationDialog() {
    const headings: Headings = {
      title: this.translateService.translate('dialogs.window_exit.title'),
      subtitle: this.translateService.translate('dialogs.window_exit.label'),
      declineBtnText: this.translateService.translate('dialogs.window_exit.decline'),
      confirmBtnText: this.translateService.translate('dialogs.window_exit.confirm'),
    };

    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          this.dialogRef.close();
          this.closeSettings(false);
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  closeSettings(isCloseSettings) {
    if (isCloseSettings) {
      this.messageBus.emit('settings.close.app', '');
    }
  }
}
