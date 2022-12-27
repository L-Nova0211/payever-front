import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: 'div[activeScroll]',
})

export class ActiveScrollDirective {
  @Output() activeScroll = new EventEmitter<boolean>();

  @HostListener('mouseenter', ['$event'])
  onMouseEnter() {
    this.activeScroll.emit(true);
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave() {
    this.activeScroll.emit(false);
  }

}
