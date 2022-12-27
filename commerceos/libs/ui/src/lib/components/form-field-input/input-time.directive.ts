import { Directive, ElementRef, HostListener } from '@angular/core';
import moment from 'moment';

@Directive({
  selector: 'input[peInputTime]',
})
export class PeInputTimeDirective {

  constructor(private elementRef: ElementRef) { }

  @HostListener('focusout', ['$event.target'])
  onFocusOut() {
    const value = this.elementRef.nativeElement.value;
    if (!moment(value, 'HH:mm').isValid()) {
      const [hour, minute] = value.split(':');
      const time = moment().set({
        hour: Math.max(0, Math.min(23, parseInt(hour, 10))),
        minute: Math.max(0, Math.min(59, parseInt(minute, 10))),
      });

      this.elementRef.nativeElement.value = time.format('HH:mm');
    }
  }
}
