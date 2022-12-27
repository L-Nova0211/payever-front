import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EnvService } from '@pe/common';
import { ColorPickerFormat, ErrorBag, FormAbstractComponent, FormScheme } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { SectionsService } from '../../services';
import { VariantStorageService } from '../../services/variant-storage.service';

interface ColorPickerInterface {
  colorHex: string;
  colorName: string;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pr-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  providers: [ErrorBag],
})
export class ColorPickerComponent extends FormAbstractComponent<ColorPickerInterface> implements OnInit {
  colorPickerFormat = ColorPickerFormat;
  color = '';
  formScheme: FormScheme;
  isSubmitted = false;
  isSubmitting = false;
  protected formStorageKey = 'colorPicker.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private translateService: TranslateService,
    private variantStorageService: VariantStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private envService: EnvService,
    private sectionsService: SectionsService,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      colorHex: ['#FFFFFF', Validators.required],
      colorName: ['', Validators.required],
    });
    this.formScheme = {
      fieldsets: {
        color: [
          {
            name: 'colorHex',
            type: 'input',
            fieldSettings: {
              classList: `input-field`,
              label: this.translateService.translate('colorPicker.placeholders.colorValue'),
            },
            inputSettings: {
              placeholder: this.translateService.translate('colorPicker.placeholders.colorValue'),
              autocompleteAttribute: 'off',
            },
          },
          {
            name: 'colorName',
            type: 'input',
            fieldSettings: {
              classList: `input-field`,
              label: this.translateService.translate('placeholders.colorName'),
            },
            inputSettings: {
              placeholder: this.translateService.translate('placeholders.colorName'),
              autocompleteAttribute: 'off',
            },
          },
        ],
      },
    };
  }

  protected createForm(initialData: ColorPickerInterface): void {
  }

  protected onSuccess(): void {
    this.isSubmitting = true;
    const { colorHex, colorName } = this.form.value;
    this.variantStorageService.setNewVariantColor({ hexColor: colorHex, label: colorName, value: colorName });
    this.closeColorPicker();
  }

  protected onUpdateFormData(formValues: {}): void {
  }

  closeColorPicker(): void {
    const isEdit = this.variantStorageService.getIsEdit();
    if (isEdit) {
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
