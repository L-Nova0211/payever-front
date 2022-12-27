import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-edit-currency-styles',
  template: '',
  styles: [`
    .edit-currency-autocomplete.picker-autocomplete-panel.theme-dark .mat-option,
    .edit-currency-autocomplete.picker-autocomplete-panel.transparent-dark .mat-option{
      color: #ffffff;
    }
    .edit-currency-autocomplete.picker-autocomplete-panel.light-dark .mat-option{
      color:  #000000;
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class EditCurrencyStylesComponent {}
