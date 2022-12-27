import { Directive, OnDestroy } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[peChatRoomListIntersection]',
})
export class PeChatRoomListIntersectionDirective implements OnDestroy {
  private mapping: Map<Element, Function>;
  private observer: IntersectionObserver;

  constructor() {
    this.mapping = new Map();
    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        for (const entry of entries) {
          const callback = this.mapping.get(entry.target);
          (callback && callback(entry.isIntersecting));
        }
      }
    );
  }

  public add( element: HTMLElement, callback: Function ) : void {
    this.mapping.set( element, callback );
    this.observer.observe( element );
  }

  public ngOnDestroy() : void {
    this.mapping.clear();
    this.observer.disconnect();
  }

  public remove( element: HTMLElement ) : void {
    this.mapping.delete( element );
    this.observer.unobserve( element );
  }
}