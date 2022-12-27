import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebDirectivesModule } from '../../directives';
import { PebFormControlModule } from '../../form-control';

import { PebFontListComponent } from './font-list.component';
import { PebTextForm } from './text-form.component';
import { PebTextFormService } from './text-form.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    PebFormControlModule,
    ScrollingModule,
    PebDirectivesModule,
  ],
  declarations: [
    PebTextForm,
    PebFontListComponent,
  ],
  exports: [
    PebTextForm,
  ],
  providers: [
    PebTextFormService,
  ],
})
export class PebTextFormModule {
}
