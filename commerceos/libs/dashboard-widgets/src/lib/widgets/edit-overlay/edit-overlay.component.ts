import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { merge, Observable, throwError } from 'rxjs';
import { catchError, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { AbstractComponent, CosEnvService } from '@pe/base';
import { BusinessInterface, BusinessState } from '@pe/business';
import { AppThemeEnum, EnvironmentConfigInterface, MicroRegistryService, PE_ENV } from '@pe/common';
import { DockerState } from '@pe/docker';
import { PE_OVERLAY_CONFIG } from '@pe/overlay-widget';
import { EditWidgetsService } from '@pe/shared/widget';
import { SnackbarService } from '@pe/snackbar';

import { WidgetTypeEnum } from '../../interfaces';
import { WidgetsApiService } from '../../services/widgets-api.service'

import { EditMode } from './edit-mode.enum';
import { TranslateService } from '@pe/i18n-core';

@Component({
  selector: 'edit-overlay',
  templateUrl: './edit-overlay.component.html',
  styleUrls: ['./edit-overlay.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOverlayComponent extends AbstractComponent implements OnInit, OnDestroy {

  widgets = this.widgetsService.widgetlist.filter(w=>w.type!==WidgetTypeEnum.Ads);
  EditMode = EditMode;
  currentMode = EditMode.apps;
  @SelectSnapshot(DockerState.dockerItems) apps;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  theme:AppThemeEnum;

  cloneApps;

  constructor(
    private widgetsService: EditWidgetsService,
    private envService: CosEnvService,
    private store: Store,
    private widgetApi: WidgetsApiService,
    private microRegistryService: MicroRegistryService,
    private apiService: ApiService,
    private authService: PeAuthService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: any,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
    private cdr: ChangeDetectorRef,
  ) {
    super()
    this.theme = AppThemeEnum[this.businessData?.themeSettings?.theme] || AppThemeEnum.default

  }

  ngOnInit(): void {
    this.cloneApps = cloneDeep(this.apps);

    this.apps.forEach((app) => {
      const i = this.getWidgetIndexByTitle(app.title);
      if (i !== -1 && app.installed === false) {
        this.disabledWidget(app.installed, i);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  changeMode(mode: EditMode) {
    this.currentMode = mode
  }

  widgetChange(e, item, i) {
    this.toggleWidget(e, item._id).pipe(
      take(1),
      tap(() => {
        this.widgets[i].installed = e;
        this.peOverlayConfig.onSaveSubject$.next({ apps: this.cloneApps, widgets: this.widgets });
      })
    ).subscribe();
  }

  toggleWidget(onOF, item) {
    if (onOF) {
      return this.envService.isPersonalMode
        ? this.widgetApi.installPersonalWidget(item)
        : this.widgetApi.installWidget(this.businessData._id, item);
    }

    return  this.envService.isPersonalMode
      ? this.widgetApi.uninstallPersonalWidget(item)
      : this.widgetApi.uninstallWidget(this.businessData._id, item);
  }

  appChange(e, item, i) {
    const index = this.getWidgetIndexByTitle(item.title);
    if (index !== -1) {
      this.disabledWidget(e, index);
      this.cdr.detectChanges();
    }

    const data = { installed: e };
    this.cloneApps[i].isLoading = true;

    let toggleInstalledApp$ = this.apiService.toggleInstalledApp(this.businessData._id, item.microUuid, data);
    if (this.envService.isPersonalMode) {
      toggleInstalledApp$ = this.apiService.userToggleInstalledApp(item.microUuid, data);
    }
    toggleInstalledApp$.pipe(
      switchMap(() => {
        this.widgetsService.widgetsEvent();
        this.cloneApps[i].installed = e;
        this.cloneApps[i].isLoading = false;
        this.cloneApps[i].setupStatus = item.setupStatus || 'notStarted';
        this.peOverlayConfig.onSaveSubject$.next({
          apps: this.cloneApps,
          widgets: this.widgets,
        });
        this.cdr.detectChanges();

        let afterInstall$: Observable<any>[] = [
          this.microRegistryService.getPersonalRegisteredMicros(),
        ];

        if (!this.envService.isPersonalMode) {
          afterInstall$ = [
            this.apiService.enableBusiness(this.businessData._id)
            .pipe(
              switchMap((res) => {
                  return this.authService.setTokens({
                    accessToken: res.accessToken,
                    refreshToken: res.refreshToken,
                  })
                }
              ),
              catchError((error) => {
                this.snackbarService.toggle(true, {
                  content: this.translateService.translate('widgets.errors.business_enable'),
                  duration: 2500,
                  iconColor: 'red',
                  iconId: 'icon-alert-24',
                  iconSize: 24,
                });

                return throwError(error);
              }),
            ),
            this.microRegistryService.getRegisteredMicros(this.businessData._id),
          ];
        }

        if (index !== -1) {
          afterInstall$.push(this.toggleWidget(e, this.widgets[index]._id));
        }

        return merge(...afterInstall$);
      })
    ).subscribe();
  }

  getWidgetIndexByTitle(title: string) {
    return this.widgets.findIndex(widget => widget.title.toLowerCase() === title.toLowerCase());
  }

  disabledWidget(e, i: number) {
    this.widgets[i].appIsNotInstalled = !e;
    this.widgets[i].installed = e;
    this.widgets[i].disabled = !e;
  }
}
