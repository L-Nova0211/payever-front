import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { AppThemeEnum, EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { ActualPeStatisticsApi, PeWidgetService, ucfirst } from '../../infrastructure';
import { PeStatisticsEditFormComponent } from '../../overlay/edit-form/edit-statistics-form.component';
import { sizeOptions } from '../../overlay/form/statistics-form.component';
import {
  ConfirmDialogContentsInterface,
  ConfirmDialogService,
} from '../../shared/confirm-dialog/confirm-dialog.service';
import { mapWidgetData } from '../../shared/utils';
import { MOCK_DATA } from '../mock.data';

@Component({
  selector: 'peb-widget-wrapper',
  templateUrl: './widget-wrapper.component.html',
  styleUrls: ['./widget-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetWrapperComponent implements OnInit, OnDestroy {
  protected readonly destroyed$: any = new Subject();

  /** Widget config */
  @Input() config: any = {};

  /** Use mock data source */
  @Input() useDefaultDataSource = false;

  /** Show/hide edit button */
  @Input() showEditBtn = false;

  /** Whether line graph is resizable */
  @Input() resizableLineGraph = false;

  /** Selected theme */
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  /** Overlay ref */
  editOverlayRef: PeOverlayRef;

  /** Whether widget is clickable */
  @HostBinding('class.clickable') @Input() isClickable = false;

  /** Binds widget class */
  @HostBinding('class') class = `${this.theme}-widget`;

  /**
   * Whether is edit mode active
   * @deprecated
   */
  editMode = false;

  constructor(
    protected cdr: ChangeDetectorRef,
    protected apiService: ActualPeStatisticsApi,
    protected widgetService: PeWidgetService,
    private overlayWidgetService: PeOverlayWidgetService,
    private envService: EnvService,
    private translateService: TranslateService,
    private authTokenService: PeAuthService,
    private confirmService: ConfirmDialogService,
  ) {}

  /** On edit button click opens edit dialog */
  onEditMode = () => {
    const onSaveSubject$ = new BehaviorSubject(null);
    const data = {
      data: this.config,
    };
    const headerConfig = {
      onSaveSubject$,
      title: this.translateService.translate('statistics.overlay_titles.edit_widget'),
      backBtnTitle: this.translateService.translate('statistics.action.cancel'),
      backBtnCallback: () => {
        const contents: ConfirmDialogContentsInterface = {
          title: this.translateService.translate('statistics.confirm_dialog.are_you_sure'),
          subtitle: this.translateService.translate('statistics.confirm_dialog.subtitle_exit'),
          confirmButton: this.translateService.translate('statistics.action.yes'),
          declineButton: this.translateService.translate('statistics.action.no'),
        };
        this.confirmService.openConfirmDialog(this.theme, contents);
        this.confirmService.afterClosed.pipe(take(1)).subscribe((isConfirm) => {
          if (isConfirm) {
            onSaveSubject$.next(false);
            this.editOverlayRef.close();
          }
        });
      },
      doneBtnTitle: this.translateService.translate('statistics.action.done'),
      doneBtnCallback: () => {
        onSaveSubject$.next(true);
        this.editOverlayRef.close();
      },
      onSave$: onSaveSubject$.asObservable(),
      theme: this.theme,
    } as any;
    this.editOverlayRef = this.overlayWidgetService.open({
      data,
      headerConfig,
      component: PeStatisticsEditFormComponent,
      backdropClick: () => {
        const contents: ConfirmDialogContentsInterface = {
          title: this.translateService.translate('statistics.confirm_dialog.are_you_sure'),
          subtitle: this.translateService.translate('statistics.confirm_dialog.subtitle_exit'),
          confirmButton: this.translateService.translate('statistics.action.yes'),
          declineButton: this.translateService.translate('statistics.action.no'),
        };
        this.confirmService.openConfirmDialog(this.theme, contents);
        this.confirmService.afterClosed.pipe(take(1)).subscribe((isConfirm) => {
          if (isConfirm) {
            this.editOverlayRef.close();
          }
        });

        return EMPTY;
      },
    });
  }

  ngOnInit(): void {
    /** Refreshes widget on edit */
    this.widgetService.refreshWidget$.subscribe((val) => {
      if (val) {
        if (this.config.id === val) {
          this.widgetService.webSocket.send(
            JSON.stringify({
              event: 'get-data',
              data: {
                widgetId: this.config.id,
                token: this.authTokenService.token,
              },
            }),
          );
        }
      }
    });
    /**
     * Whether widget is filtered
     * if filtered all values show 0
     */
    if (this.config?.filtered) {
      const data = this.config.widgetSettings.map((settings) => {
        if (settings.length === 0) {
          return null;
        } else if (settings.length === 1) {
          if (settings[0].type === 'text') {
            return settings[0].value;
          }
        } else {
          return 0;
        }
      });
      const newData = [];
      let chunk = [];
      data.forEach((element, index) => {
        if (index !== 0) {
          if (index % 3 === 0) {
            newData.push(chunk);
            chunk = [];
          }
        }
        chunk.push(element);
        if (index === data.length - 1) {
          newData.push(chunk);
        }
      });

      this.config.dataSource = mapWidgetData(newData);
      this.cdr.detectChanges();
    } else {
      /** Gets widget data */
      if (this.widgetService.webSocket) {
        this.widgetService.webSocket.addEventListener('open', (open) => {
          this.widgetService.webSocket.send(
            JSON.stringify({
              event: 'get-data',
              data: {
                widgetId: this.config.id,
                token: this.authTokenService.token,
              },
            }),
          );
        });
        this.widgetService.webSocket.addEventListener('message', (response: { data: string }) => {
          const dataRaw = JSON.parse(response.data);
          if (this.config.id === dataRaw.widgetId) {
            if (dataRaw.data) {
              const newDataSource = mapWidgetData(dataRaw.data);
              this.config.dataSource = newDataSource;
              this.cdr.detectChanges();

              return;
            }
          }
        });
        this.widgetService.webSocket.addEventListener('error', (err: any) => {
          console.log('error', err);
        });
      }

      /** Sets mock data */
      if (this.useDefaultDataSource) {
        if (this.widgetService.widgetType.DetailedNumbers === this.config.viewType) {
          this.config.dataSource = MOCK_DATA['widgetStyle'];
          this.config.dataSource[0][0].text = ucfirst(this.widgetService.selectedApp);
          this.cdr.detectChanges();
        } else {
          this.config.dataSource = MOCK_DATA[this.config.viewType];
          this.config.dataSource[0][0].text = ucfirst(this.widgetService.selectedApp);
          this.cdr.detectChanges();
        }
      }
    }
  }

  /** Gets line graph size */
  getGraphView(size) {
    return sizeOptions.find(sizeOption => sizeOption.size === size)?.graphView;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
