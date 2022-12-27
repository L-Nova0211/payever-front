import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { MediaContainerType, MediaUrlPipe, MediaUrlTypeEnum } from '@pe/media';

import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { VariantsSection } from '../../../../shared/interfaces/section.interface';
import { CurrencyService } from '../../../../shared/services/currency.service';
import { SectionsService } from '../../../services';
import { LanguageService } from '../../../services/language.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'variants-section',
  templateUrl: 'editor-variants-section.component.html',
  styleUrls: ['editor-variants-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class EditorVariantsSectionComponent implements OnInit {
  currency: string;
  readonly section: ProductEditorSections = ProductEditorSections.Variants;
  variantsSection: VariantsSection[] = this.sectionsService.variantsSection;
  showVariantDetails = true;
  errors: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sectionsService: SectionsService,
    private mediaUrlPipe: MediaUrlPipe,
    private changeDetectorRef: ChangeDetectorRef,
    private languageService: LanguageService,
    private destroyed$: PeDestroyService,
    private currencyService: CurrencyService
  ) {
  }

  ngOnInit(): void {
    merge(
      this.sectionsService.saveClicked$.pipe(
        tap(() => {
          if (this.sectionsService.variantsSection.some(variant => !variant.sku || variant.sku === '')) {
            this.sectionsService.onFindError(true, this.section);
          } else {
            this.sectionsService.onFindError(false, this.section);
          }
        })
      ),
      this.languageService.updatedLanguage$.pipe(
        tap(() => {
          this.variantsSection = this.sectionsService.variantsSection;
          this.sectionsService.variantsChange$.next(this.variantsSection);
          this.changeDetectorRef.detectChanges();
        })
      ),
      this.sectionsService.variantsChange$.pipe(
        tap(() => {
          this.variantsSection = this.sectionsService.variantsSection;

          this.errors = false;
          const variantSkuDefault = this.variantsSection.length && this.variantsSection[0].sku;
          const isFirstItem = 
            this.sectionsService?.currentVariant?.id === (this.variantsSection.length && this.variantsSection[0].id);
          
          let index = 0;
          this.variantsSection.forEach((variant) => {
            if(isFirstItem && variantSkuDefault && variant.sku === '') {
              variant.sku = `${variantSkuDefault}-${++index}`;
            }
            if (!variant.sku || variant.sku === '') {
              this.errors = true;
            }
          });

          this.changeDetectorRef.detectChanges();
        }),
      )
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();

    this.currency = this.currencyService.currency;
  }

  getVariant(options) {
    let str = '';

    options.forEach((option) => {
      str = str !== '' ? `${str}; ${option.value}` : `${option.value}`;
    });

    return str;
  }

  onCreateNew(): void {
    this.router.navigate([{ outlets: { auxiliary: ['variant' ] } }], {
      skipLocationChange: true,
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  onEdit(id: string): void {
    this.sectionsService.resetState$.next(false);
    this.router.navigate([{ outlets: { auxiliary: ['variant', id ] } }], {
      skipLocationChange: true,
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  onDelete(id: string): void {
    this.sectionsService.removeVariant(id);
  }

  getImagePath(blob: string): string {
    if (blob) {
      return this.mediaUrlPipe.transform(`${blob}`, MediaContainerType.Products, MediaUrlTypeEnum.Thumbnail);
    }
  }
}
