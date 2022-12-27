import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';
import { PeGridItem } from '@pe/grid';

import { IconsService } from '../../../../services/icons.service';
import { TransactionInterface } from '../../../../shared';

@Component({
  selector: 'pe-channel-icon',
  templateUrl: './channel-component.html',
  styleUrls: ['./channel-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ChannelComponent implements AfterViewInit {

  @Input() item: PeGridItem<TransactionInterface>;
  @Input() isBig = false;
  @Input() isThumbnail = false;

  theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  get isDesktop(): boolean {
    return window.innerWidth > 720;
  }

  constructor(
    private iconService: IconsService,
    private cdr: ChangeDetectorRef,
    private envService: EnvService,
  ) {}

  ngAfterViewInit() {
    this.cdr.detach();
  }

  get getIcon(): string {
    return this.item ? this.iconService.getChannelIconId(this.item.data.channel, this.theme) : null;
  }
}
