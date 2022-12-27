import { ElementRef } from '@angular/core';

import { PeGridItem, PeGridView } from '@pe/grid';

export abstract class PeCommonItemService {
  public lastGridView: PeGridView;

  public abstract appointmentItemToGridItemMapper(items: any, canvas: ElementRef): PeGridItem[]
}
