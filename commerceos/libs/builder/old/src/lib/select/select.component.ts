// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { FormControl } from '@angular/forms';
// import { filter, first } from 'lodash';
// import { takeUntil, tap } from 'rxjs/operators';
//
// import { PeDestroyService } from '@pe/common';

export interface SelectOption {
  name: string;
  style?: string;
  value?: any;
}

// export interface SidebarSelectOption {
//   name?: string;
//   label?: string;
//   value: string;
// }

// @Component({
//   selector: 'peb-editor-sidebar-select',
//   templateUrl: 'select.component.html',
//   styleUrls: ['./select.component.scss'],
//   providers: [PeDestroyService],
// })
// export class PebEditorSelectComponent implements OnInit {
//   @Input() control: FormControl;
//   @Input() options?: SelectOption[];
//
//   @Input() notSelected = false;
//
//   @Input() disabled = false;
//   @Input() large = false;
//   @Input() labelKey = 'name';
//   @Input() valueKey = 'name';
//   @Output() blurOn = new EventEmitter();
//
//   selectedOption: SelectOption;
//
//   constructor(private readonly destroy$: PeDestroyService) {
//   }
//
//   ngOnInit() {
//     if (!this.options || this.options.length === 0) {
//       return;
//     }
//
//     if (!this.control) {
//       throw new Error('You must provide form control for `peb-editor-sidebar-select`');
//     }
//
//     /**
//      * Initially, this code in control did not pass the value, but the whole object,
//      * and a lot of select was made using this. I rewrote the code so that a specific value
//      * could be selected and the old code would not break.
//      * When the old code will not remain. This part needs to be optimized.
//      */
//
//     if (this.control.value && this.control.value[this.valueKey]) {
//       // TODO: Reenable this before merging
//       // console.warn(
//       //   `Select ${this.control.value[this.valueKey]}.` +
//       //   'Do not pass the entire object to control.' +
//       //   'Only its value is enough'
//       // );
//     }
//
//     this.setSelectedOption(this.control.value);
//
//     this.control.valueChanges.pipe(
//       tap((value) => {
//         this.setSelectedOption(value);
//         this.control.patchValue(this.selectedOption, { emitEvent: false });
//       }),
//       takeUntil(this.destroy$),
//     ).subscribe();
//   }
//
//   getValue(option: any) {
//     return this.control?.value && this.control?.value[this.valueKey] ? option : option[this.valueKey];
//   }
//
//   getLabel(option: any) {
//     return option && option[this.labelKey] ? option[this.labelKey] : null;
//   }
//
//   private setSelectedOption(value) {
//     this.selectedOption =
//       value
//         ? first(filter(this.options, (option) => {
//           return option[this.valueKey] === this.control.value
//             || option[this.valueKey] === this.control.value[this.valueKey];
//         }))
//         : null;
//   }
//
//   changeValue($event: any) {
//     this.control.patchValue($event);
//   }
// }
