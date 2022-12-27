import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Data } from '@angular/router';

import { AppThemeEnum, MessageBus } from '@pe/common';
import { ThemeSwitcherService } from '@pe/theme-switcher';

import { AbstractComponent } from '../../components/abstract';
import { BusinessInterface, PeThemeEnum } from '../../misc/interfaces';
import { ApiService, BusinessEnvService, EnvironmentConfigService } from '../../services';

@Component({
  selector: 'peb-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppearanceComponent extends AbstractComponent implements OnInit {
  peThemeEnum = PeThemeEnum;
  appThemeEnum = AppThemeEnum;
  form: FormGroup;
  automatic: false;
  theme = this.businessEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.businessEnvService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  constructor(
    private businessEnvService: BusinessEnvService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private themeService: ThemeSwitcherService,
    private cdr: ChangeDetectorRef,
    public configService: EnvironmentConfigService,
    public messageBus: MessageBus,
  ) {
    super();
    const theme = this.businessEnvService.businessData?.themeSettings?.theme || PeThemeEnum.DEFAULT;
    this.form = this.fb.group({
      default: [theme === PeThemeEnum.DEFAULT || theme === PeThemeEnum.DARK],
      light: [theme === PeThemeEnum.LIGHT],
      transparent: [theme === PeThemeEnum.TRANSPARENT],
      automatic: [this.businessEnvService.businessData?.currentWallpaper?.auto],
    });
  }

  ngOnInit(): void {
    this.form.controls.automatic.valueChanges.subscribe((res) => {
      this.onToggle(res);
    });
  }

  submit() {

  }

  onToggle(value) {
    this.automatic = value;

    if (this.automatic) {
      this.theme = this.businessEnvService.businessData.currentWallpaper?.theme;
      this.form.controls['default'].setValue(false);
      this.form.controls['light'].setValue(false);
      this.form.controls['transparent'].setValue(false);
      if (this.theme) {
        this.form.controls[this.businessEnvService.businessData.currentWallpaper?.theme].setValue(true);
      }
    }

    this.updateCurrentBusinessTheme();
  }

  changeValue(name, arr) {
    const value = this.form.controls[name].value;
    if (this.automatic) {
      this.form.controls.automatic.setValue(false);
    }
    if (!arr.find(item => item.includes(name)) && this.form.controls[name].value !== false) {
      this.form.controls[name].patchValue(value);
      this.theme = name;
      this.toggleTheme();
      arr.forEach((item) => {
        this.form.controls[item].patchValue(!value);
      });
    } else {
      this.form.controls[name].patchValue(!value);
    }
  }

  toggleTheme() {
    this.automatic = false;
    this.updateCurrentBusinessTheme();
  }

  private updateCurrentBusinessTheme() {
    const currentWallpaper = this.businessEnvService.businessData.currentWallpaper?.wallpaper
      ? this.businessEnvService.businessData.currentWallpaper.wallpaper
      : null;
    this.apiService.updateBusinessWallpapers(this.businessEnvService.businessUuid, {
      themeSettings: {
        theme: this.theme,
      },
      currentWallpaper: {
        auto: this.automatic,
        wallpaper: currentWallpaper?.substring(currentWallpaper.lastIndexOf('/') + 1, currentWallpaper.length),
      },
    }).subscribe(
      (businessData: BusinessInterface) => {
        this.setThemeFieldsFromBusinessData(businessData);
        this.messageBus.emit('change.theme', businessData.themeSettings.theme);
        this.businessEnvService.businessData = businessData;
        this.themeService.changeTheme( AppThemeEnum[businessData.themeSettings.theme]);
        this.themeService.autoMode$.next(this.automatic);
        this.cdr.detectChanges();
      },
    );
  }

  setThemeFieldsFromBusinessData(businessData: Data) {
    this.automatic = businessData.currentWallpaper.auto;
    if (this.automatic) {
      this.theme = businessData.currentWallpaper.theme || businessData.themeSettings.theme || PeThemeEnum.DEFAULT;
    } else {
      this.theme = businessData.themeSettings.theme || PeThemeEnum.DEFAULT;
    }
  }
}
