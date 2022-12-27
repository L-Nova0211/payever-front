import { Directive, ElementRef, OnDestroy, OnInit, AfterViewInit, Renderer2, HostBinding, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WindowService } from '@pe/window';

import { BrowserDetectService } from '../services';

const RIGHT_PADDING = 20; // fix iOs scrollbar, increased to 20 for FF 65 beta (NK-1126)

@Directive({
  selector: '[peScrollHide]',
})
export class ScrollHideDirective implements OnInit, AfterViewInit, OnDestroy {

  @HostBinding('class.data-grid-scroll-container') cssClass = true;
  @Input() hideHorizontalScrollbar = false;
  private destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private browserDetectService: BrowserDetectService,
    private windowService: WindowService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
  }

  ngOnInit(): void {
    this.renderer.setStyle(this.elementRef.nativeElement, 'overflow-y', `scroll`);
    this.renderer.setStyle(this.elementRef.nativeElement, 'scrollbar-width', `none`);
    if (this.hideHorizontalScrollbar) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'overflow-x', `hidden`);
    }

    this.windowService.width$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.update());
  }

  ngAfterViewInit(): void {
    this.update();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private update(): void {

    if (this.browserDetectService.isIE) {
      return;
    }

    const element: HTMLElement = (this.elementRef.nativeElement as HTMLElement);

    const scrollWidth: number = element.offsetWidth - element.clientWidth;
    const widthSize: number = RIGHT_PADDING + (scrollWidth ? scrollWidth + 1 : 0);
    const scrollHeight: number = element.offsetHeight - element.clientHeight;
    let offseTop = 0;
    if (element.offsetTop < 0) {
      offseTop = -1 * element.offsetTop;
    }


  }

}
