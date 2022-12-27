import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { ScreenTypeEnum } from '../../enums';

@Component({
  selector: 'pe-screen-type',
  templateUrl: './screen-type.component.html',
  styleUrls: ['./screen-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenTypeStyleComponent {
  selected: ScreenTypeEnum = ScreenTypeEnum.Desktop;

  screens: ScreenTypeEnum[] = [
    ScreenTypeEnum.Desktop,
    ScreenTypeEnum.Mobile,
  ];

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any
  ) {
    this.overlayConfig.doneBtnCallback = () => {
      this.overlayData.screen$.next(this.selected);
      this.overlayData.close();
    }

    this.selected = this.overlayData.selected;
  }

  trackByFn(i: number): number {
    return i;
  }

  onSelect(screen: ScreenTypeEnum): void {
    this.selected = screen;
  }
}
