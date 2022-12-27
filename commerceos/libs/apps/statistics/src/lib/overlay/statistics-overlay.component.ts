import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DoCheck,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { delay, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeWidgetService } from '../infrastructure';
import { ConfirmDialogContentsInterface, ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'peb-statistics-overlay',
  templateUrl: './statistics-overlay.component.html',
  styleUrls: ['./statistics-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsOverlayComponent implements OnInit, DoCheck, OnDestroy {
  edit = false;
  private backButton: HTMLCollectionOf<Element>;

  readonly destroyed$ = new ReplaySubject<boolean>();

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private cdr: ChangeDetectorRef,
    public widgetService: PeWidgetService,
    private translateService: TranslateService,
    private confirmService: ConfirmDialogService,
    private envService: EnvService,
  ) {
    const theme = envService.businessData?.themeSettings?.theme
      ? AppThemeEnum[envService.businessData?.themeSettings?.theme]
      : AppThemeEnum.default;
    this.overlayConfig.onSave$
      .pipe(
        tap((onSave) => {
          if (widgetService.currentPage === 0) {
            setTimeout(() => {
              overlayConfig.backBtnTitle = translateService.translate('statistics.action.cancel');
            });
          }
          if (this.widgetService.currentPage === 0 && onSave) {
            this.widgetService.viewType = widgetService.widgetType.DetailedNumbers;
          }
          if (this.widgetService.currentPage === 0 && onSave === false) {
            const contents: ConfirmDialogContentsInterface = {
              title: translateService.translate('statistics.confirm_dialog.are_you_sure'),
              subtitle: translateService.translate('statistics.confirm_dialog.subtitle_exit'),
              confirmButton: translateService.translate('statistics.action.yes'),
              declineButton: translateService.translate('statistics.action.no'),
            };
            this.confirmService.openConfirmDialog(theme, contents);
            this.confirmService.afterClosed.pipe(take(1)).subscribe((isConfirm) => {
              if (isConfirm) {
                this.widgetService.overlayRef.close();
              }
            });
          }
          if (onSave === true && this.widgetService.currentPage < 3) {
            if (widgetService?.selectedApp) {
              this.widgetService.currentPage += 1;
              this.overlayConfig.onSaveSubject$.next(null);
            }
          }
          if (onSave === false && this.widgetService.currentPage > 0) {
            this.widgetService.currentPage -= 1;
            this.overlayConfig.onSaveSubject$.next(null);
          }
          if (widgetService.currentPage === 3) {
            setTimeout(() => {
              overlayConfig.doneBtnTitle = translateService.translate('statistics.action.done');
            });
          }
          if (widgetService.currentPage < 3) {
            setTimeout(() => {
              overlayConfig.doneBtnTitle = translateService.translate('statistics.action.next');
            });
          }
        }),
        delay(100),
        tap(() => {
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnInit(): void {
    const element = this.widgetService.overlayRef.getOverlayElement();
    this.backButton = element.getElementsByClassName('overlay-widget__back');
  }

  ngDoCheck(): void {
    this.backButton[0].innerHTML =
        this.translateService.translate(`statistics.action.${!this.widgetService.currentPage ? 'cancel' : 'back'}`);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
