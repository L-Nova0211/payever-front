import { ChangeDetectionStrategy, Component, forwardRef, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebOption, PebSelectOptionListComponent } from './option-list.component';

@Component({
  selector: 'peb-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useValue: forwardRef(() => PebSelectComponent),
      multi: true,
    },
  ],
})
export class PebSelectComponent implements ControlValueAccessor {

  @Input() disabled: boolean;
  @Input() label: string;
  @Input() options: PebOption[];
  @Input() placeholder?: string;

  readonly value$ = new BehaviorSubject<string>('');

  onChange: (value: string) => void;
  onTouched: () => void;

  get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    private editorAccessorService: PebEditorAccessorService,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: string): void {
    const option = this.options.find(o => o.value === value);
    this.value$.next(option ? option.name : '');
  }

  openOptionList() {
    const slot = PebEditorSlot.sidebarOptionList;
    const sidebarCmpRef = this.editor.insertToSlot(PebSelectOptionListComponent, slot);

    this.editor.optionList = { back: 'Back', title: this.label };

    sidebarCmpRef.instance.active = this.ngControl?.value;
    sidebarCmpRef.instance.options = this.options;
    sidebarCmpRef.instance.selected.pipe(
      take(1),
      tap((value: any) => {
        this.onChange(value);
        this.onTouched();
        this.writeValue(value);
        this.editor.backTo('detail');
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }
}
