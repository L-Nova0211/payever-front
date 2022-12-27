import { Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { animationFrameScheduler, fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap, throttleTime } from 'rxjs/operators';

@Directive({
  selector: '[pebAutoHideScrollBar]',
})
export class PebAutoHideScrollbarDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private elRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {
    fromEvent(this.elRef.nativeElement, 'scroll', { passive: true }).pipe(
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      tap(() => {
        this.renderer.addClass(this.elRef.nativeElement, 'scrolling');
      }),
      debounceTime(500),
      tap(() => {
        this.renderer.removeClass(this.elRef.nativeElement, 'scrolling');
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
