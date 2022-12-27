import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { I18nModule } from '@pe/i18n';
import { PebButtonModule } from '@pe/ui';

import { PeMediaEditorComponent } from './media-editor';
import { PeMediaUrlPipe } from './pipes';
import { PeMediaService } from './services';

const angularModules = [
  CommonModule,
  MatIconModule,
  ReactiveFormsModule,
];

const peModules = [
  I18nModule,
  PebButtonModule,
];

@NgModule({
  declarations: [
    PeMediaEditorComponent,
    PeMediaUrlPipe,
  ],
  imports: [
    ...angularModules,
    ...peModules,
  ],
  exports: [
    PeMediaEditorComponent,
    PeMediaUrlPipe,
  ],
  providers: [PeMediaService],
})
export class PeMediaEditorModule { }
