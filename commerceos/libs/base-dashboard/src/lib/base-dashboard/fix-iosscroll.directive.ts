import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[fixiOsScrollFreezing]',
})
export class FixIOSScrollFreezingDirective implements OnInit {
  private containerPadding = 0;

  private scrollNode: any;

  private lastY = 0; // Needed in order to determine direction of scroll.

  constructor(private el: ElementRef) {
    this.onTouchstart = this.onTouchstart.bind(this);
    this.onTouchmove = this.onTouchmove.bind(this);
  }

  ngOnInit() {
    this.scrollNode = this.el.nativeElement;
    if (this.scrollNode) {
      this.scrollNode.addEventListener('touchstart', this.onTouchstart);
      this.scrollNode.addEventListener('touchmove', this.onTouchmove);
    }
  }

  private onTouchstart(event: TouchEvent) {
    if (!event.cancelable) {
      return;
    }

    this.lastY = event.touches[0].clientY;

    this.containerPadding = 0;
    const styles = getComputedStyle(this.scrollNode.parentNode);
    if (styles.padding) {
      const padList = styles.padding.split('px');
      if (padList.length) {
        try {
          this.containerPadding = Number(padList[0]);
        } catch (e) {}
      }
    }
  }

  private onTouchmove(event: TouchEvent) {
    if (!event.cancelable) {
      return;
    }

    const top = event.touches[0].clientY;
    const targeNode: any = this.scrollNode;
    if (targeNode) {
      // Determine scroll position and direction.
      const container = targeNode.parentNode;
      const scrollTop = container.scrollTop;
      const direction = this.lastY - top < 0 ? 'up' : 'down';

      // FIX IT!
      if (scrollTop === 0 && direction === 'up') {
        // Prevent scrolling up when already at top as this introduces a freeze.
        event.preventDefault();
      } else {
        const scrBorder = targeNode.scrollHeight - (container.clientHeight - this.containerPadding);
        if (scrollTop >= scrBorder && direction === 'down') {
          // Prevent scrolling down when already at bottom as this also introduces a freeze.
          event.preventDefault();
        }
      }
    }
    this.lastY = top;
  }
}
