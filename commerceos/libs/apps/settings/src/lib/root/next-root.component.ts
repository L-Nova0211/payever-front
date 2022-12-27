import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  OnInit,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessState, SettingsBusinessInterface } from '@pe/business';
import { MessageBus, EnvService } from '@pe/common';
import { AppThemeEnum } from '@pe/common';

import { BusinessEnvService } from '../services';
import { PeSettingsHeaderService } from '../services/settings-header.service';


@Component({
  selector: 'cos-next-root',
  templateUrl: './next-root.component.html',
  styleUrls: ['./next-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosNextRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(BusinessState.businessData) businessData: SettingsBusinessInterface;

  theme: string = AppThemeEnum.default;

  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private settingsHeaderService: PeSettingsHeaderService,
    private cdr: ChangeDetectorRef,
    @Inject(EnvService) private envService: BusinessEnvService,
  ) {
    this.theme = (this.businessData?.themeSettings?.theme) && AppThemeEnum[this.businessData.themeSettings.theme]
      ? AppThemeEnum[this.businessData.themeSettings.theme]
      : AppThemeEnum.default;
    this.messageBus.listen('change.theme').subscribe((res: any) => {
      this.theme = AppThemeEnum[res];
      this.settingsHeaderService.loadBusinessData(this.businessData._id).subscribe(
        (res) => {
          this.envService.businessData = res;
          this.envService.businessId = res._id;
        }
      );
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {

    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'settings',
      'edit-panel',
    ]);

    this.settingsHeaderService.initialize();
  }

  ngOnDestroy() {
    this.settingsHeaderService.destroy();
  }
}
