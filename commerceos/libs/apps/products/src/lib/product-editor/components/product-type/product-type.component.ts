import { Component, OnInit } from '@angular/core';

import { ProductTypes } from '../../../shared/enums/product.enum';
import { SectionsService } from '../../services';

@Component({
  selector: 'product-type',
  templateUrl: 'product-type.component.html',
  styleUrls: ['product-type.component.scss'],
})
export class ProductTypeComponent implements OnInit {
  readonly productTypeEnum: typeof ProductTypes = ProductTypes;
  productType: ProductTypes = ProductTypes.Physical;

  constructor(private sectionsService: SectionsService) {}

  ngOnInit(): void {
    this.productType = this.sectionsService.productType;
    this.sectionsService.productType$.next(this.productType);
  }

  onChange(value: ProductTypes): void {
    this.sectionsService.onChangeProductType(value);
  }
}
