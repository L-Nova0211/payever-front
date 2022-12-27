import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { tap, takeUntil } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { FormSchemeItemInterface } from '../../interfaces';
import { ScreenTypeStylesService } from '../../services/screen-type.service';

@Component({
  selector: 'pe-style-modal',
  templateUrl: './style-modal.component.html',
  styles: [`
    .style-modal-container {
      border-radius: 12px;
      overflow: hidden;
    }

    .style-modal-container .pe-info-box-container-fixed {
      margin-bottom: 0 !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class StyleModalComponent {

  constructor(
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
    this.screenTypeStylesService.screen$.pipe(
      tap(() => this.cdr.markForCheck()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  get items(): FormSchemeItemInterface[] {
    return this.overlayData.controls;
  }

  get parentForm(): FormGroup {
    return this.overlayData.parentForm;
  }

  get theme(): AppThemeEnum {
    return this.overlayData.theme;
  }

  get screenTypeStylesService():ScreenTypeStylesService {
    return this.overlayData.screenTypeStylesService;
  }

  isShowScreen(item: FormSchemeItemInterface): boolean {
    return this.screenTypeStylesService.isShowScreen(item?.screen);
  }

  trackByItems(i: number, item: FormSchemeItemInterface): string {
    return item.controlName;
  }
}
