import { ChangeDetectorRef, Injectable, Injector } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { filter, take, tap, takeUntil } from 'rxjs/operators';

import { AppThemeEnum, EnvironmentConfigInterface, EnvService, PeDestroyService, PE_ENV } from '@pe/common';
import { PeDateTimePickerService } from '@pe/ui';

interface MaskRuleInterface {
  guide: boolean;
  mask: (string | RegExp)[];
  showMask: boolean;
}

@Injectable()
export class ControlDateService {
  private dateTimePicker: PeDateTimePickerService = this.injector.get(PeDateTimePickerService);
  private destroyed$: PeDestroyService = this.injector.get(PeDestroyService);
  private cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  private matIconRegistry: MatIconRegistry = this.injector.get(MatIconRegistry);
  private env: EnvironmentConfigInterface = this.injector.get(PE_ENV);
  private domSanitizer: DomSanitizer = this.injector.get(DomSanitizer);
  private envService: EnvService = this.injector.get(EnvService);

  private dateMask = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];

  theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    protected injector: Injector,
  ) {
    this.matIconRegistry.addSvgIcon(
      'calendar',
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/calendar-icon.svg`)
    );
  }

  maskRule(): MaskRuleInterface {
    return {
      guide: false,
      mask: this.dateMask,
      showMask: false,
    };
  };

  openDatepicker(event: MouseEvent, dateControl: AbstractControl): void {
    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
      position: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: -12,
        offsetY: 12,
      },
      config: {
        headerTitle: 'Date',
        range: false,
        format: 'DD/MM/YYYY',
        maxDate: null,
        daysToDisable: [],
      },
    });
    dialogRef.afterClosed
      .pipe(
        take(1),
        filter(date => !!date),
        tap((date) => {
          dateControl.patchValue(date.start);
          dateControl.markAsDirty();
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$))
      .subscribe();
  }
}
