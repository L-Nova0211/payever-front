import { DragDropModule } from '@angular/cdk/drag-drop';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebTranslateService } from '@pe/common';
import { I18nModule, TranslateService } from '@pe/i18n';
import { OverlayWidgetModule } from '@pe/overlay-widget';

import { PeAutocompleteModule } from '../autocomplete';
import { PebButtonModule } from '../button';
import { PebButtonToggleModule } from '../button-toggle';
import { PebDateTimePickerModule } from '../datetime-picker';
import { PebExpandablePanelModule } from '../expandable-panel';
import { PebFormBackgroundModule } from '../form-background';
import { PebFormFieldInputModule } from '../form-field-input';
import { PebFormFieldTextareaModule } from '../form-field-textarea';
import { PebProductPickerModule } from '../product-picker';
import { PebRadioModule } from '../radio-button';
import { PebSelectModule } from '../select';
import { PebTimePickerModule } from '../time-picker';

import { PeCutomFieldComponent } from './custom-field-component';
import { PeCutomFieldsSwitcherComponent } from './custom-fields-switcher';
import { TextAreaAutosizeModule } from '../textarea-autosize';

@NgModule({
    declarations: [
      PeCutomFieldComponent,
      PeCutomFieldsSwitcherComponent
    ],
    imports: [
        CommonModule,
        DragDropModule,
        OverlayWidgetModule,
        TextFieldModule,
        MatMenuModule,
        MatDialogModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,

        PeAutocompleteModule,
        PebButtonModule,
        PebButtonToggleModule,
        PebDateTimePickerModule,
        PebExpandablePanelModule,
        PebFormBackgroundModule,
        PebFormFieldInputModule,
        PebFormFieldTextareaModule,
        PebProductPickerModule,
        PebRadioModule,
        PebSelectModule,
        PebTimePickerModule,

        I18nModule,
        TextAreaAutosizeModule
    ],
    providers:[
        {
            provide: PebTranslateService,
            useExisting: TranslateService,
          },
    ],
    exports: [
      PeCutomFieldComponent,
      PeCutomFieldsSwitcherComponent
    ],
  })
export class CustomFieldModule{

}
