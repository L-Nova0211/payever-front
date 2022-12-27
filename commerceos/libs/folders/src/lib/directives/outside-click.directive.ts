import { Directive, Output, EventEmitter, ElementRef, OnInit, NgZone, OnDestroy } from '@angular/core';

@Directive({
  selector: 'input[peClickOutside]',
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  @Output() clickOutside = new EventEmitter<string>();

  constructor(
    private elementRef: ElementRef,
    private ngZone: NgZone,
  ) { }


  ngOnInit(): void {
    setTimeout(() => {
      this.initClickOutsideListener();
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickBody);
  }

  private initClickOutsideListener(): void {
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('click', this.clickBody.bind(this));
    });
  }

  private clickBody(e: Event): void {
    const clickedInside = this.elementRef.nativeElement.contains(e.target);
    if (!clickedInside) {
      this.ngZone.run(() => {
        this.clickOutside.emit(this.elementRef.nativeElement.value);
      })
    }
  }
}
