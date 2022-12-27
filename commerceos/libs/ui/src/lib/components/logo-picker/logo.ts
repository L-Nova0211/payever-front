import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

let uniqueId = 0;

@Component({
  selector: 'peb-logo-picker',
  templateUrl: './logo.html',
  styleUrls: ['./logo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebLogoPickerComponent {
  inputId = `logo-picker-${(uniqueId += 1)}`;
  /** File upload container */
  files;
  /** Sets image */
  @Input() image;
  /** Sets abbrevation */
  @Input() abbrevation: string;
  /** Emits when file changed */
  @Output() file: EventEmitter<any> = new EventEmitter<any>();
  /** Emits when click delete button */
  @Output() deleteLogo: EventEmitter<void> = new EventEmitter<void>();
  /** Whether Sets spinner if true */
  @Input() isImageLoading = false;
  /** Sets button label */
  @Input() buttonLabel = 'Add Logo';

  /** When file is change emmit event */
  fileChangeEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    this.files = target.files as FileList;
    this.file.emit(this.files);
  }
}
