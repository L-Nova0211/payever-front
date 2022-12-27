import { Directive, Injector } from '@angular/core';

import { PebDeviceService } from '@pe/common';

import { PeGridViewportService } from '../../viewport/viewport.service';
import { PeGridView } from '../enums';


import { GridBaseItemClassDirective } from './base-item.class';

@Directive()
export class GridMobileItemClassDirective extends GridBaseItemClassDirective {

  protected deviceService: PebDeviceService = this.injector.get(PebDeviceService);
  protected peGridViewportService: PeGridViewportService = this.injector.get(PeGridViewportService);

  constructor(
    protected injector: Injector,
  ) {
    super(injector);
  }

  get isListWithMobileView(): boolean {
    return this.peGridViewportService.view == PeGridView.ListWithMobile;
  }

  get isMobile(): boolean {
    return this.isListWithMobileView && (document.body.clientWidth <= 720 || this.deviceService.isMobile);
  }
}
