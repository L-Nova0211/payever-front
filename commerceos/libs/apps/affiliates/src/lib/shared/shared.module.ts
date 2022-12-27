import { NgModule } from '@angular/core';

import { PeFolderEditorModule, PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebRadioModule,
  PebSelectModule,
  PeListModule,
  PeSearchModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PeSubscriptModule,
} from '@pe/ui';

const modules = [
  PeFolderEditorModule,
  PeFoldersModule,
  PeGridModule,
  I18nModule,
  // UI
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebRadioModule,
  PebSelectModule,
  PeListModule,
  PeSearchModule,
  PeSubscriptModule,
];

@NgModule({
  imports: [
    ...modules,
  ],
  exports: [
    ...modules,
  ],
})
export class SharedModule { }
