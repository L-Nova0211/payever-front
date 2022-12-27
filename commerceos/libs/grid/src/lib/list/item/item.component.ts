import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  TemplateRef,
} from '@angular/core';
import { tap, takeUntil } from 'rxjs/operators';

import { PeGridItem } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { PeGridMenuService } from '../../menu';
import { GridMobileItemClassDirective } from '../../misc/classes/mobile-item.class';
import { PeGridTableDisplayedColumns } from '../../misc/interfaces';
import { PeGridViewportService } from '../../viewport';
import { PeGridListService } from '../list.service';


@Component({
  selector: 'pe-grid-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class PeGridItemComponent extends GridMobileItemClassDirective {
  @Input() toAdd = false;
  @Input() excludeColumns: string[] = [];
  @Input() previewTitle = this.translateService.translate('grid.items.preview');
  @Input() disableContextMenu = false;
  @Input() disableSelect = false;
  @Input() template:TemplateRef<PeGridItem>;
  @Input() autoHeightImage = false;

  displayColumnsData: PeGridTableDisplayedColumns[] = [];

  constructor(
    public peGridViewportService: PeGridViewportService,
    protected injector: Injector,
    protected menuService: PeGridMenuService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private listService: PeGridListService,
  ) {
    super(injector);

    this.listService.displayedColumns$.pipe(
      tap((columns) => {
        this.displayColumnsData = columns;
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  get isMobileListWithMobileView(): boolean {
    return this.isMobile && this.isListWithMobileView;
  }

  get isMobile(): boolean {
    return document.body.clientWidth <= 720 || this.deviceService.isMobile;
  }
}
