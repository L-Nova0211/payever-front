import { ChangeDetectionStrategy, Component, ElementRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

enum ThemesIcons {
  'delete' = 'delete.svg',
}
@Component({
  selector: 'pe-files-upload',
  styleUrls: ['./file-upload.component.scss'],
  templateUrl: './file-upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent implements ControlValueAccessor {
  onChange: Function;
  public files: FileList | null = null;

  @HostListener('change', ['$event.target.files']) emitFiles( event: FileList ) {
    const files = event;
    this.onChange(files);
    this.files = files;
  }

  constructor(
    private host: ElementRef<HTMLInputElement>,
    public iconRegistry: MatIconRegistry,
    public domSanitizer: DomSanitizer
  ) {
      Object.entries(ThemesIcons).forEach(([name, path]) => {
        iconRegistry.addSvgIcon(
          name,
          domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`),
        );
      });
  }

  removeFileFromFileList(index) {
    const dt = new DataTransfer();
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      if (index !== i) {
        dt.items.add(file);
      }
    }
    this.files = dt.files;
    this.onChange(this.files);
  }

  writeValue( value: null ) {
    this.files = value;
  }

  registerOnChange( fn: Function ) {
    this.onChange = fn;
  }

  registerOnTouched( fn: Function ) {
  }

}
