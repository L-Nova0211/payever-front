import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PebEditorSharedModule } from '@pe/builder-shared';

import { ShopEditorProductGapsForm } from './forms';

const forms = [
  ShopEditorProductGapsForm,
];

@NgModule({
  declarations: [
    ...forms,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PebEditorSharedModule,
  ],
  exports: [
    ...forms,
  ],
})
export class PebShopSharedModule {
}
