import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { I18nModule } from '@pe/i18n';
import { PeMediaEditorModule } from '@pe/media';
import {
  PebButtonModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
} from '@pe/ui';

import { PeFoldersActionsService, PeFoldersApiService } from '../../services';

import { PeFolderEditorComponent } from './folder-editor.component';

const angularModules = [
  CommonModule,
  ReactiveFormsModule,
];

const peModules = [
  I18nModule,
  PebButtonModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PeMediaEditorModule,
];

@NgModule({
  declarations: [PeFolderEditorComponent],
  exports: [PeFolderEditorComponent],
  imports: [
    ...angularModules,
    ...peModules,
  ],
  providers: [
    PeFoldersActionsService,
    PeFoldersApiService,
  ],
})
export class PeFolderEditorModule { }
