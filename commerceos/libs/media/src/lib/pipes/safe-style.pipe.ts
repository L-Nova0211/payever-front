import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Pipe({
  name: 'safeStyle',
})
export class SafeStylePipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}
  transform(style: string): SafeStyle {
    return this.domSanitizer.bypassSecurityTrustStyle(style);
  }
}
