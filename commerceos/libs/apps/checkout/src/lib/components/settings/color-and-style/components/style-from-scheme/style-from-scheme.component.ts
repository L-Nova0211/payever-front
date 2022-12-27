import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { tap, takeUntil } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';

import {
  FormSchemeGroupInterface,
  FormSchemeInterface,
  FormSchemeItemInterface,
  FormSchemeModalInterface,
} from '../../interfaces';
import { ScreenTypeStylesService } from '../../services/screen-type.service';

@Component({
  selector: 'pe-style-from-scheme',
  templateUrl: './style-from-scheme.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class StyleFormSchemeComponent {
  @Input() theme: AppThemeEnum;
  @Input() parentForm: FormGroup;
  @Input() formScheme: FormSchemeInterface;

  constructor(
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private screenTypeStylesService: ScreenTypeStylesService,
  ) {
    this.screenTypeStylesService.screen$.pipe(
      tap(() => this.cdr.markForCheck()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  get groups(): FormSchemeGroupInterface[] {
    return this.formScheme?.groups;
  }

  trackByFn(i: number): number {
    return i;
  }

  trackByItems(i: number, item: FormSchemeItemInterface): string {
    return item.controlName;
  }

  getModalsByGroup(groupIndex: number): FormSchemeModalInterface[] {
    return this.formScheme?.groups[groupIndex]?.modals ?? [];
  }

  getItemsByGroup(groupIndex: number): FormSchemeItemInterface[] {
    return this.formScheme?.groups[groupIndex]?.controls ?? [];
  }

  isShowScreen(item: FormSchemeItemInterface): boolean {
    return this.screenTypeStylesService.isShowScreen(item?.screen);
  }
}
