import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { AbstractComponent } from '@pe/base';
import { AppThemeEnum } from '@pe/common';
import { PeUser } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';
import { WindowService } from '@pe/window';
import { BusinessInterface, BusinessState } from '@pe/business';
import { TranslateService } from '@pe/i18n-core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

@Component({
  selector: 'base-dashboard',
  templateUrl: './base-dashboard.component.html',
  styleUrls: ['./base-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDashboardComponent extends AbstractComponent implements OnDestroy, OnInit {
  @Input() loaded = false;
  @Input() user: PeUser;
  @Input() theme: AppThemeEnum;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  @Output() dockerItemsChange: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() profileButtonClicked: EventEmitter<void> = new EventEmitter<void>();

  isMobile$ = this.windowService.isMobile$;

  greetingVariant: number = Math.floor(Math.random() * 4) + 1;

  constructor(
    private windowService: WindowService,
    private wallpaperService: WallpaperService,
    private translateService: TranslateService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.wallpaperService.showDashboardBackground(true);
    this.theme = AppThemeEnum[this.businessData?.themeSettings?.theme] || AppThemeEnum.default;
  }

  get greeting1() {
    return 'greeting.welcome';
  }

  get greeting2() {
    return `greeting.variant_${this.greetingVariant}`;
  }

  get userName() {
    return this.user.firstName || this.user.lastName || '';
  }

  getTranslates() {
    return this.translateService.hasTranslation(`greeting.variant.${this.businessData.industry}`)
      ? `${this.translateService.translate(`greeting.variant_industry`)}
          ${this.translateService.translate(`greeting.variant.${this.businessData.industry}`)}`
      : this.translateService.translate(`greeting.variant_${this.greetingVariant}`);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
