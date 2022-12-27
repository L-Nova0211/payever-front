import {
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
} from '@angular/core';
import { fromEvent, merge, race, Subscription } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

@Directive({
  selector: '[longpressevent]',
})
export class PeLongPressEventDirective implements OnDestroy {
  private eventSubscribe: Subscription;
  threshold = 550;

  @Output()
  longPress = new EventEmitter();

  constructor(private elementRef: ElementRef) {
   
    const touchstart = fromEvent(elementRef.nativeElement, 'touchstart').pipe(
      map((event: TouchEvent) => ({ event, pass: true }))
    );
    const touchEnd = fromEvent(elementRef.nativeElement, 'touchend').pipe(
      map((event: TouchEvent) => ({ event, pass: false }))
    );
    const contextMenu = fromEvent(elementRef.nativeElement, 'contextmenu');

    const touchEvents = merge(touchstart, touchEnd)
      .pipe(
        debounceTime(this.threshold),
        filter((value) => value.pass),
        map((value: any) => {
          value.event.x = value.event.targetTouches[0].clientX;
          value.event.y = value.event.targetTouches[0].clientY;

          return value.event;
        })
      );
    this.eventSubscribe = race(contextMenu, touchEvents)
      .pipe(
        map((event : any) => {
          event.preventDefault();
          event.stopPropagation();
          this.longPress.emit(event);
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.eventSubscribe) {
      this.eventSubscribe.unsubscribe();
    }
  }
}
