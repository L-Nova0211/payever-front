import { ChangeDetectorRef, Component, HostBinding, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDataGridItem, PeDataGridLayoutType, PeDestroyService } from '@pe/common';
import { PeDataGridService, PeDataGridSidebarService } from '@pe/data-grid';
import { LocaleConstantsService } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageProductItem } from '../../interfaces/message-product-item.interface';
import { PeMessageApiService } from '../../services';

@Component({
  selector: 'pe-message-product-list',
  templateUrl: './message-product-list.component.html',
  styleUrls: ['./message-product-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PeMessageProductListComponent implements OnInit {

  loading = false;
  items: PeDataGridItem[] = [];
  selectedItems: string[] = [];

  @HostBinding('class.pe-message-product-list') peMessageProductList = true;

  constructor(
    private destroyed$: PeDestroyService,
    private changeDetectionRef: ChangeDetectorRef,
    private localeConstantsService: LocaleConstantsService,
    private mediaUrlPipe: MediaUrlPipe,
    private peDataGridService: PeDataGridService,
    private peDataGridSidebarService: PeDataGridSidebarService,
    private peMessageApiService: PeMessageApiService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: any,
    private translateService: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.peDataGridService.setSelected$.next([]);
    this.peMessageApiService.getProductList().pipe(
      tap((products: PeMessageProductItem[]) => {
        products.forEach((product: PeMessageProductItem) => {
          const price = new Intl.NumberFormat(this.localeConstantsService.getLocaleId(), {
            style: 'currency',
            currency: product.currency ?? 'EUR',
          }).format(product.price);

          this.items.push({
            id: product._id,
            image: this.mediaUrlPipe.transform(product.images[0], MediaContainerType.Products, 'grid-thumbnail' as any),
            title: product.title,
            subtitle: price,
            description: `${product.stock ?? 0} ${this.translateService.translate('message-app.product-list.in_stock')}`,
            customFields: [
              { content: product.categories?.map((category: any) => category.title).join('/') },
              { content: price },
              { content: `${product.variantCount ?? 0} / ${product.stock ?? 0}` },
            ],
            selected: true,
            actions: [{
              label: this.translateService.translate('message-app.sidebar.add'),
              callback: (id: string) => {
                this.peOverlayConfig.onSaveSubject$.next([id]);
              },
            }],
          } as PeDataGridItem);
        });

        this.loading = true;

        this.changeDetectionRef.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  onClose(): void {
    this.peOverlayConfig.onSaveSubject$.next([]);
  }

  onAdd(): void {
    this.peOverlayConfig.onSaveSubject$.next(this.selectedItems);
  }

  onMultipleSelectedItemsChanged(selectedItems: string[]): void {
    this.selectedItems = selectedItems;
  }

  onLayoutTypeChanged(layout: PeDataGridLayoutType): void {
    if (layout === PeDataGridLayoutType.Grid) {
      setTimeout(() => this.peDataGridSidebarService.detectChange$.next());
    }
  }

}
