import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding, Inject,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Subject } from 'rxjs';

import { APP_TYPE, AppThemeEnum, AppType, EnvService, PreloaderState } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { WallpaperService } from '@pe/wallpaper';

import { PeMessageHeaderService } from '../services/message-header.service';

@Component({
  selector: 'cos-message-root',
  templateUrl: './message-root.component.html',
  styleUrls: [
    './message-root.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosMessageRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  @HostBinding('class') class = this.theme;

  @ViewChild('settingsMenu') settingsMenu!: TemplateRef<any>;

  settingsMenuOverlayRef: OverlayRef;
  settingsMenuItems = [
    {
      icon: '#icon-connect-block-16',
      title: this.translateService.translate('message-app.message-interface.connect'),
      onClick: () => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/message/connect`);
      },
    },
    {
      icon: '#icon-world-20',
      title: this.translateService.translate('message-app.message-interface.integration'),
      onClick: () => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/message/integration`);
      },
    },
  ];

  destroyed$ = new Subject<boolean>();

  constructor(
    public router: Router,
    private translateService: TranslateService,
    private overlay: Overlay,
    private envService: EnvService,
    private viewContainerRef: ViewContainerRef,
    private wallpaperService: WallpaperService,
    private peMessageHeaderService: PeMessageHeaderService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {}

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  ngOnInit() {

    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
    ]);

    // Hide old platform header because next root component uses new platform header
    this.wallpaperService.showDashboardBackground(false);

    const leftSectionItems = [{
      title: this.translateService.translate('message-app.message-interface.settings'),
      class: 'settings',
      onClick: () => {
        this.openOverlaySettingsMenu();
      },
    }];

    this.peMessageHeaderService.init(leftSectionItems);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.peMessageHeaderService.destroy();
    sessionStorage.removeItem('current_chat_id');
    sessionStorage.removeItem('current_chats_draft');
  }

  private openOverlaySettingsMenu(): void {
    this.settingsMenuOverlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .left('51px')
        .top('51px'),
      hasBackdrop: true,
      panelClass: this.theme,
      backdropClass: 'pe-message-settings-menu-backdrop',
    });

    this.settingsMenuOverlayRef.backdropClick().subscribe(() => this.settingsMenuOverlayRef.dispose());
    this.settingsMenuOverlayRef.attach(new TemplatePortal(this.settingsMenu, this.viewContainerRef));
  }
}
