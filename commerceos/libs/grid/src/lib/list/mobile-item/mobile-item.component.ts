import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { EnvironmentConfigInterface, PeDestroyService, PE_ENV, PeHelpfulService } from '@pe/common';

import { GridBaseItemClassDirective } from '../../misc/classes/base-item.class';
import { PeGridView } from '../../misc/enums';
import { PeGridItem, PeGridTableDisplayedColumns } from '../../misc/interfaces';
import { PeGridViewportService } from '../../viewport';
import { PeGridListService } from '../list.service';


@Component({
  selector: 'pe-grid-mobile-item',
  templateUrl: './mobile-item.component.html',
  styleUrls: ['./mobile-item.component.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class PeGridMobileItemComponent extends GridBaseItemClassDirective implements OnChanges {
  readonly peGridView = PeGridView;

  image = null;
  text: SafeHtml;
  defaultImage = `${this.env.custom.cdn}/icons-transactions/image-placeholder-white.svg`

  @Input() disableContextMenu = false;
  @Input() displayColumns: PeGridTableDisplayedColumns[] = [];

  @ViewChild('moreButton') moreButtonRef: ElementRef;

  @HostListener('contextmenu', ['$event']) onContextMenu(e: PointerEvent) {
    if (this.disableContextMenu) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.openContextMenu(e);
  }

  get folderIcon() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.env.custom.cdn + '/icons/app-icon-folder.svg');
  }

  get isMobile(): boolean {
    return document.body.clientWidth <= 720;
  }

  constructor(
    public peGridViewportService: PeGridViewportService,
    public listService: PeGridListService,
    protected injector: Injector,
    protected destroy$: PeDestroyService,
    private gridHelpfulService: PeHelpfulService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { itemContextMenu, item, displayColumns } = changes;

    if (displayColumns?.currentValue) {
      this.displayColumns = displayColumns.currentValue;
      this.cdr.markForCheck();
    }

    if (itemContextMenu?.currentValue) {
      this.itemContextMenu = itemContextMenu.currentValue;
    }

    if (item?.currentValue?.image) {
      this.gridHelpfulService.isValidImgUrl(item.currentValue.image).then((res) => {
        if (res.status === 200) {
          this.image = item.currentValue.image;
          this.cdr.markForCheck();
        }
      });
    }

    if (item?.currentValue?.data?.text) {
      this.text = item.currentValue.data.text;
    }
  }

  isFirstRow(item: PeGridItem): boolean {
    return this.listService.firstRow?.id == item.id;
  }

  isLastRow(item: PeGridItem): boolean {
    return this.listService.lastRow?.id == item.id;
  }

  public clickedMore(event: PointerEvent): void {
    event.stopPropagation();
    if (!this.item.isLoading$?.value) {
      this.openContextMenu(event, this.moreButtonRef);
    }
  }
}
