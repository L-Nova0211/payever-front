import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

export function requiredFileType(types: string[]) {
  return (control: FormControl) => {
    const type = (control.value as File)?.type;
    if (!type) {
      return null;
    }

    const extension = type.split('/')[1].toLowerCase();
    if (!types.find(t => t.toLowerCase() === extension.toLowerCase())) {
      return {
        requiredFileType: true,
      };
    }

    return null;
  };
}

@Component({
  selector: 'editor-file-input',
  templateUrl: './file.input.html',
  styleUrls: ['./file.input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SidebarFileInput,
      multi: true,
    },
  ],
})
export class SidebarFileInput implements ControlValueAccessor {
  @Input() label = 'Upload';
  @Input() accept = 'image/*';
  @Output() blurred = new EventEmitter();

  onChange: Function;

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    const file = event && event.item(0);
    this.onChange(file);

    this.blurred.emit();
  }

  constructor(
    private host: ElementRef<HTMLInputElement>,
  ) {}

  writeValue(value: null) {
    this.host.nativeElement.value = '';
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
  }
}
