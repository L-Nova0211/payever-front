import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

let uniqueId = 0;

@Component({
  selector: 'peb-social-sharing-image',
  templateUrl: './social-sharing-image.html',
  styleUrls: ['./social-sharing-image.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PebSocialSharingComponentComponent {
  inputId = `social-sharing-image-${(uniqueId += 1)}`;
  /** Files container */
  files;
  /** Image shown */
  @Input() image;

  /** Emits when file change */
  @Output() file: EventEmitter<any> = new EventEmitter<any>();

  /** Title value */
  @Input() title: string;

  /** Link value */
  @Input() link: string;

  /** Description value */
  @Input() description = 'Meta description';

  /** Whether image is loading. Shows spinner while true */
  @Input() isImageLoading = false;

  /** On file change emits new file */
  fileChangeEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    this.files = target.files as FileList;
    this.file.emit(this.files);
  }
}
