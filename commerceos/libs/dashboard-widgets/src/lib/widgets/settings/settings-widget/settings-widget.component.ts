import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { BusinessState } from '@pe/business';
import { MicroAppInterface } from '@pe/common';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { WallpaperService } from '@pe/wallpaper';
import { Widget } from '@pe/widgets';

import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'settings-widget',
  templateUrl: './settings-widget.component.html',
  styleUrls: ['./settings-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Input() widget: Widget;
  @SelectSnapshot(BusinessState.businessUuid) businessUuid: string;

  showWallpaperSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showLanguageSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly appName: string = 'settings';


  constructor(
    injector: Injector,
    protected wallpaperService: WallpaperService,
    private editWidgetsService: EditWidgetsService,
    protected authService: PeAuthService,
  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_SETTINGS_DATA);
  }

  ngOnInit() {
    this.widget = {
      ...this.widget,
      data: [
        {
          title: 'widgets.settings.actions.edit-wallpaper',
          isButton: true,
          // icon: '#icon-settings-dashboard-skin-48',
          onSelect: () => {
            this.onEditWallpaper();

            return EMPTY;
          },
        },
        {
          title: 'widgets.settings.actions.edit-language',
          isButton: true,
          // icon: '#icon-settings-translations-48',
          onSelect: () => {
            this.onEditLanguage();

            return EMPTY;
          },
        },
      ],
      openButtonFn: () => {
        this.onOpenButtonClick();

        return EMPTY;
      },
    };

  }

  onEditWallpaper(): void {
    this.action('/settings/wallpaper', this.showWallpaperSpinner$);
  }

  onEditLanguage(): void {
    this.action('/settings/general/language', this.showLanguageSpinner$);
  }

  onOpenButtonClick() {
    this.action('/settings/general/personal');
    const micro: MicroAppInterface = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appName);
    if (micro || this.envService.isPersonalMode) {
      let loadMicroRequest: Observable<boolean>;
      let url: string[];
      if (this.envService.isPersonalMode) {
        loadMicroRequest = this.loaderService.loadMicroScript('settings');
        url = [`personal/${this.authService.getUserData().uuid}/settings/general/personal`];
      } else {
        loadMicroRequest = this.loaderService.loadMicroScript('settings', this.businessUuid);
        url = [`business/${this.businessUuid}/settings`];
      }
      loadMicroRequest.pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.router.navigate(url).then(() => {
          this.wallpaperService.showDashboardBackground(false);
        });
      });
    }
  }

  action(urlEnd, spinner$ = null) {
    spinner$?.next(true);
    const micro: MicroAppInterface = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appName);
    if (micro || this.envService.isPersonalMode) {
      let loadMicroRequest: Observable<boolean>;
      let url: string[];
      if (this.envService.isPersonalMode) {
        loadMicroRequest = this.loaderService.loadMicroScript('settings');
        url = [`personal/${this.authService.getUserData().uuid}${urlEnd}`];
      } else {
        loadMicroRequest = this.loaderService.loadMicroScript('settings', this.businessUuid);
        url = [`business/${this.businessUuid}${urlEnd}`];
      }
      loadMicroRequest.pipe(takeUntil(this.destroyed$)).subscribe(
        () => {
          this.router.navigate(url).then(() => {
            spinner$?.next(false);
            this.wallpaperService.showDashboardBackground(false);
          });
        },
        () => {
          spinner$?.next(false);
        },
      );
    }
  }
}
