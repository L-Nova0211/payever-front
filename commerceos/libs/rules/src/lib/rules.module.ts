import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TextMaskModule } from 'angular2-text-mask';

import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { I18nCoreModule } from '@pe/i18n-core';
import {
  PeAutocompleteModule,
  PebChipsModule,
  PebDateTimePickerModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebMessagesModule,
  PebSelectModule,
} from '@pe/ui';

import { AddRuleWhenComponent } from './add-rule/add-rule-when/add-rule-when.component';
import { AddRuleComponent } from './add-rule/add-rule.component';
import { RuleCreateMessageComponent } from './components/create-message/create-message.component';
import { RuleDatePickerComponent } from './components/datepicker/rule-datepicker';
import { RuleListItemComponent } from './components/rule-list-item/rule-list-item.component';
import { RulesComponent } from './rules/rules.component';

(window as any).PayeverStatic.IconLoader.loadIcons([
  'rules',
]);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatMomentDateModule,
    MatDialogModule,
    PebFormFieldInputModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    MatDatepickerModule,
    PebDateTimePickerModule,
    MatNativeDateModule,
    PebSelectModule,
    PebMessagesModule,
    PebChipsModule,
    I18nCoreModule,
    MatFormFieldModule,
    TextMaskModule,
    PeAutocompleteModule,
    ConfirmationScreenModule,
  ],
  declarations: [
    RulesComponent,
    RuleListItemComponent,
    AddRuleComponent,
    AddRuleWhenComponent,
    RuleDatePickerComponent,
    RuleCreateMessageComponent,
  ],
  entryComponents: [
    RulesComponent,
    RuleListItemComponent,
    AddRuleComponent,
    AddRuleWhenComponent,
  ],
})
export class RulesModule {
  constructor(){
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'rules',
      'settings',
    ]);
  }
}
