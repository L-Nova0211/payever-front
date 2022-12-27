import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { VariantOptionSectionType } from '../../../shared/interfaces/section.interface';
import { SectionsService } from '../../services';
import { VariantStorageService } from '../../services/variant-storage.service';

@Component({
  selector: 'pr-option-type-picker',
  templateUrl: './option-type-picker.component.html',
  styleUrls: ['./option-type-picker.component.scss'],
})
export class OptionTypePickerComponent implements OnInit {
  possibleOptions: Array<{ type: VariantOptionSectionType; label: string }> = [];
  isEdit = this.variantStorageService.getIsEdit();

  constructor(
    private variantStorageService: VariantStorageService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sectionsService: SectionsService,
    private envService: EnvService,
  ) {}

  ngOnInit() {
    this.possibleOptions = [
      {
        type: VariantOptionSectionType.DEFAULT,
        label: this.translateService.translate('typePicker.default'),
      },
      {
        type: VariantOptionSectionType.COLOR,
        label: this.translateService.translate('typePicker.color'),
      },
    ];
  }

  onAdd(type: VariantOptionSectionType): void {
    this.variantStorageService.addNewOption(type);
    this.closeTypePicker();
  }

  closeTypePicker(): void {
    if (this.isEdit) {
      const variantId = this.variantStorageService.getVariantId();
      this.onEdit(variantId);
    } else {
      this.onCreateNew();
    }
  }

  private getUrl(url: any) {
    const baseUrl = [ 'business', this.envService.businessId, 'products', 'list' ];
    const productId = this.activatedRoute.snapshot.params.productId || null;
    const editor = [ 'products-editor', productId ? 'edit' : 'add' ];

    if (productId) { editor.push(productId); }

    editor.push(url);

    return [ ...baseUrl, { outlets: { editor } } ];
  }

  private onCreateNew(): void {
    const url = { outlets: { auxiliary: ['variant'] } };
    this.router.navigate(this.getUrl(url), {
      skipLocationChange: true,
      queryParams: { addExisting: true },
      queryParamsHandling: 'merge',
    });
  }

  private onEdit(id: string): void {
    this.sectionsService.resetState$.next(false);
    const url = { outlets: { auxiliary: ['variant', id] } };
    this.router.navigate(this.getUrl(url), {
      skipLocationChange: true,
      queryParams: { addExisting: true },
      queryParamsHandling: 'merge',
    });
  }
}
