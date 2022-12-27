import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebControlsModule } from '@pe/builder-controls';
import { PebRendererSharedModule } from '@pe/builder-renderer';
import { PebTextEditorModule } from '@pe/builder-text-editor';

import { PebDocumentMakerElement } from './document/document.maker';
import { PebGridMakerElement } from './grid/grid.maker';
import { PebSectionMakerElement } from './section/section.maker';
import { PebShapeCheckboxElementUi } from './shape/shape-checkbox/shape-checkbox.element-ui';
import { PebShapeDropdownElementUi } from './shape/shape-dropdown/shape-dropdown.element-ui';
import { PebShapeFilterSelectElement } from './shape/shape-filter-select/shape-filter-select.component';
import { PebShapeInputElementUi } from './shape/shape-input/shape-input.element-ui';
import { PebShapeSortSelectElement } from './shape/shape-sort-select/shape-sort-select.component';
import { PebShapeTextareaElementUi } from './shape/shape-textarea/shape-textarea.component';
import { PebShapeMakerElement } from './shape/shape.maker';
import { PebTextMakerElement } from './text/text.maker';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    PebControlsModule,
    PebRendererSharedModule,
    PebTextEditorModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PebDocumentMakerElement,
    PebGridMakerElement,
    PebSectionMakerElement,
    PebShapeCheckboxElementUi,
    PebShapeDropdownElementUi,
    PebShapeFilterSelectElement,
    PebShapeInputElementUi,
    PebShapeSortSelectElement,
    PebShapeTextareaElementUi,
    PebShapeMakerElement,
    PebTextMakerElement,
  ],
  exports: [
    PebDocumentMakerElement,
    PebGridMakerElement,
    PebSectionMakerElement,
    PebShapeCheckboxElementUi,
    PebShapeDropdownElementUi,
    PebShapeFilterSelectElement,
    PebShapeInputElementUi,
    PebShapeSortSelectElement,
    PebShapeTextareaElementUi,
    PebShapeMakerElement,
    PebTextMakerElement,
  ],
})
export class PebBuilderElementsModule {}
