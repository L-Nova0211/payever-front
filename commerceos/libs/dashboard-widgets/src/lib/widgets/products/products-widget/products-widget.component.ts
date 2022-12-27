import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Injector, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { forEach } from 'lodash-es';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';

import { BusinessState } from '@pe/business';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { WallpaperService } from '@pe/wallpaper';
import { Widget } from '@pe/widgets';

import { PopularProductInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

import { ProductItem } from './product-item.model';

@Component({
  selector: 'products-widget',
  templateUrl: './products-widget.component.html',
  styleUrls: ['./products-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Input() widget: Widget;
  @Select(BusinessState.businessUuid) businessUuid$: Observable<string>;

  readonly appName: string = 'products';

  showNewProductSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  popularProductsTitle: string;

  products$: Observable<ProductItem[]>;

  constructor(
    injector: Injector,
    private translateService: TranslateService,
    protected wallpaperService: WallpaperService,
    private currencyPipe: CurrencyPipe,
    private cdr: ChangeDetectorRef,
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    private sanitizer: DomSanitizer,
    private editWidgetsService: EditWidgetsService,
  ) {
    super(injector);
    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_PRODUCTS_POPULAR_MONTH_RANDOM);
    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_PRODUCTS_POPULAR_WEEK_RANDOM);

    this.products$ = this.businessUuid$.pipe(
      takeUntil(this.destroyed$),
      switchMap(businessUuid =>
        combineLatest([
          this.editWidgetsService.productsWeeklySubject$,
          this.editWidgetsService.productsMonthlySubject$,
        ]).pipe(
          switchMap(([week, month]) => {
            return of([week, month]);
          }),
        ),
      ),
      map(([week, month]: PopularProductInterface[][]) => {
        let result: ProductItem[] = [];
        const added: string[] = [];
        if (week && week.length) {
          forEach(week, (item) => {
            if (added.indexOf(item._id) < 0) {
              result.push(new ProductItem(item, this.translateService.translate('widgets.products.popular-lastWeek')));
              added.push(item._id);
            }
          });
        }
        if (month && month.length) {
          forEach(month, (item) => {
            if (added.indexOf(item._id) < 0) {
              result.push(new ProductItem(item, this.translateService.translate('widgets.products.popular-lastMonth')));
              added.push(item._id);
            }
          });
        }
        result = result.slice(0, 4);

        return result;
      }),
      tap((products: ProductItem[]) => {
        this.widget = {
          ...this.widget,
          data: products.map((product: ProductItem) => ({
            title: product.name,
            subtitle: this.currencyPipe.transform(product.price, product.currency || 'EUR'),
            imgSrc: this.sanitizer.bypassSecurityTrustStyle(
              `url('${this.envConfig.custom.storage + '/products/' + product.thumbnail}')`,
            ),
            onSelect: (product) => {
              this.onOpenProduct(product);

              return EMPTY;
            },
            onSelectData: product,
          })),
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
          this.cdr.detectChanges();
      }),
      shareReplay(1),
    );
  }

  ngOnInit() {
    this.products$.subscribe();
    this.popularProductsTitle = this.translateService.translate('widgets.products.most-popular').replace(/\s/g, '<br>');
  }

  onOpenProduct(product: ProductItem) {
    product.loading$.next(true);
    this.router.navigate(['business', this.businessData._id, this.appName, 'list',
    { outlets: { editor: ['products-editor','edit', product.id] } }]).then(() => {
      product.loading$.next(false);
      this.wallpaperService.showDashboardBackground(false);
    });
  }

  onAddNewProduct(): void {
    this.showNewProductSpinner$.next(true);
    this.loaderService
    .loadMicroScript(this.appName, this.businessData._id)
    .pipe(takeUntil(this.destroyed$))
    .subscribe(
      () => {
        this.router
        .navigate(['business', this.businessData._id, this.appName])
        .then(() => this.showNewProductSpinner$.next(false));
      },
      () => {
        this.showNewProductSpinner$.next(false);
      },
    );
  }
}
