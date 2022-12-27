import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, EMPTY } from 'rxjs';
import {
  filter,
  map,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { TranslationLoaderService } from '@pe/i18n';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { WallpaperService } from '@pe/wallpaper';
import { Widget } from '@pe/widgets';

import { ConnectIntegrationInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'connect-widget',
  templateUrl: './connect-widget.component.html',
  styleUrls: ['./connect-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Input() widget: Widget;

  readonly appName: string = 'connect';

  readonly TOP_LIST_LENGTH: number = 4;

  integrationWithSpinner$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  showEditButtonSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  integrations$: Observable<any> = this.widgetService.connectIntegrations$

  topIntegrations$: Observable<ConnectIntegrationInterface[]> = this.integrations$.pipe(
    takeUntil(this.destroyed$),
    filter((integrations: ConnectIntegrationInterface[]) => !!integrations && !!integrations.length),
    map((integrations: ConnectIntegrationInterface[]) => integrations.slice(0, this.TOP_LIST_LENGTH)),
    tap((integrations) => {
      if (integrations?.length > 0) {
        this.widget = {
          ...this.widget,
          data: integrations.map(integration => ({
            title: integration.displayOptions?.title,
            isButton: true,
            onSelect: (data) => {
              this.onGoToIntegration(data);

              return EMPTY;
            },
            onSelectData: integration,
          })),
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
      }
      this.cdr.detectChanges();
    }),
  );

  constructor(
    injector: Injector,
    private translationLoaderService: TranslationLoaderService,
    private wallpaperService: WallpaperService,
    private cdr: ChangeDetectorRef,
    private widgetService:EditWidgetsService,
  ) {
    super(injector);

    this.widgetService.emitEventWithInterceptor(MessageNameEnum.CONNECT_INTEGRATION_NON_INSTALLED);
  }

  ngOnInit(): void {
    this.showSpinner$.next(true);

    this.topIntegrations$.subscribe();

    combineLatest([
      this.translationLoaderService.loadTranslations(['commerceos-connect-integrations-widget']),
      this.integrations$,
    ])
      .pipe(take(1))
      .subscribe(() => {
        this.showSpinner$.next(false);
      });
  }

  onGoToIntegration(connection: ConnectIntegrationInterface): void {
    if (connection) {
      this.integrationWithSpinner$.next(connection.name);
      this.router.navigate(
        [`business/${this.businessData._id}/connect`],
        { queryParams: { integrationName: connection.category } }
      ).then(() => this.wallpaperService.showDashboardBackground(false));
    } else {
      console.warn(`Can't open empty integration`);
    }
  }

  onConnectAddClick(): void {
    this.showEditButtonSpinner$.next(true);
    this.router
      .navigate([`business/${this.businessData._id}/connect`])
      .then(() => this.wallpaperService.showDashboardBackground(false));
  }
}
