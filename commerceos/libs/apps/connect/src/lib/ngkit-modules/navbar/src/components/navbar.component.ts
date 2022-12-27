import {
  Component, Input, ChangeDetectionStrategy, HostBinding, ViewChild,
  ElementRef, AfterViewInit, ChangeDetectorRef, Renderer2, OnDestroy,
} from '@angular/core';
import { Observable, BehaviorSubject, of, ReplaySubject, fromEvent } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { NavbarColor, NavbarControlPosition, NavbarPosition, NavbarStyle } from '../enums';
import { NavbarControlInterface } from '../interfaces';
import { NavbarControl } from '../types';

@Component({
  selector: 'pe-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements AfterViewInit, OnDestroy {

  @HostBinding('class.pe-navbar') hostClass = true;
  @ViewChild('scrollContainer', { read: ElementRef }) scrollContainer: ElementRef<HTMLElement>;
  @ViewChild('toolbar', { read: ElementRef, static: true }) toolbar: ElementRef<HTMLElement>;

  @Input() allowSettingsManualScroll = true; // When menu item is input and user is trying to select range
  @Input() areaClasses: Map<NavbarControlPosition, string>;
  @Input() classes: string;
  @Input() color: NavbarColor = NavbarColor.Light;
  @Input() lockLeftArea: boolean;
  @Input() position: NavbarPosition = NavbarPosition.Default;
  @Input() scrollable = false;
  @Input() style: NavbarStyle = NavbarStyle.None;
  @Input('controls') set setControls(controls: NavbarControl[]) {
    if (controls) {
      this.controls = controls.map((control$: NavbarControl) => {
        return this.asObservable(control$);
      });
    } else {
      this.controls = [];
    }
  }

  controls: NavbarControl[];
  spinerStrokeWidth = 2;
  spinerDiameter = 18;
  toolbarHeight: number;
  isScrolling$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private startSwipeValue = 0;
  private swipeValue = 0;

  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(private chRef: ChangeDetectorRef,
              private scrollingContent: ElementRef,
              private renderer: Renderer2
  ) {
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit(): void {

    if (this.scrollable) {
      this.setScrollableToolbarHeight();

      fromEvent(window, 'resize').pipe(
        takeUntil(this.destroyed$),
        map(() => window.innerWidth),
        distinctUntilChanged()
      ).subscribe(() => {
        this.setScrollableToolbarHeight();
      });

      this.scrollContainer.nativeElement.addEventListener('mousewheel', (event: WheelEvent) => {
        this.scrollContainer.nativeElement.scrollLeft -= (event.deltaY || 0) / 2;
      });
    }

    const handler: any = (event: WheelEvent) => { // DOMMouseScroll for FF
      event.stopPropagation();
      event.preventDefault();

      // mouse wheel scroll up, content scrolled to the right
      if ((event.deltaY || event['detail'] || event.deltaY || 0) < 0) { // 'detail' for FF, wheelDelta for IE
        const scrollingValue = 40;
        this.startSwipeValue += scrollingValue; // + 22; // TODO 22 - margin, find another way
        if (this.startSwipeValue > 0) {
          this.startSwipeValue = 0;
        }
      }
      // mouse wheel scroll down, content scrolled to the left
      else {
        const scrollingValue = -40;
        this.startSwipeValue += scrollingValue;
        if (this.startSwipeValue < -1 * this.getMaxPanValue()) {
          this.startSwipeValue = -1 * this.getMaxPanValue();
        }
      }

      this.renderer.setStyle(this.scrollContainer.nativeElement, 'transform', `translateX(${this.startSwipeValue}px)`);
    };

    this.scrollingContent.nativeElement.addEventListener('mousewheel', handler);
    this.scrollingContent.nativeElement.addEventListener('DOMMouseScroll', handler);
  }

  getNavbarControls(): Observable<NavbarControlInterface>[] {
    if (this.controls) {
      return this.controls.map((control$: NavbarControl) => {
        return this.asObservable(control$);
      });
    } else {
      return [];
    }
  }

  getIconClass(icon: string, iconSize: number): string {
    const size: string = iconSize ? `-${iconSize}` : /-[0-9]+$/.exec(icon)[0];

    return size ? `icon icon${size}` : '';
  }

  getIconId(icon: string): string {
    return `#${icon}`;
  }

  getAreaClasses(position: string): string {
    if (this.areaClasses && this.areaClasses.has(NavbarControlPosition[position])) {
      return this.areaClasses.get(NavbarControlPosition[position]);
    }
  }

  onPan(data: { deltaX: number, distance: number; }): void {
    if ( !this.allowSettingsManualScroll ) {
      return;
    }

    this.isScrolling$.next(true);

    const k: number = data.deltaX > 0 ? 1 : -1;
    this.swipeValue = this.startSwipeValue + k * data.distance;

    if (k > 0 && this.swipeValue >= 0) {
      this.swipeValue = 0;
    } else if (this.getMaxPanValue() < 0) {
      this.swipeValue = 0;
    } else if (k < 0 && this.swipeValue < -1 * this.getMaxPanValue()) {
      this.swipeValue = -1 * this.getMaxPanValue();
    }

    this.renderer.setStyle(this.scrollContainer.nativeElement, 'transform', `translateX(${this.swipeValue}px)`);
  }

  onPanEnd(data: any): void {
    this.startSwipeValue = this.swipeValue;
    this.isScrolling$.next(false);
  }

  handleKeydown(event: KeyboardEvent, key: string, onClickCallback: () => void): void {
    if (!key || event.defaultPrevented) {
      return;
    }

    const target: HTMLElement = event['target'] as HTMLElement;
    if (event.key === key && target.tagName.toLowerCase() !== 'input'
      && target.tagName.toLowerCase() !== 'textarea') {
      onClickCallback();
    }
  }

  makeDataAttribute(value: string): string {
    return value
      ? value.toLowerCase().split(' ').join('+')
      : null;
  }

  private getMaxPanValue(): number {
    return this.scrollContainer.nativeElement.scrollWidth - this.toolbar.nativeElement.offsetWidth;
  }

  private asObservable<T>(value: T | Observable<T>): Observable<T> {
    return value && value['_isScalar'] !== undefined ?
      (value as Observable<T>) :
      of(value as T);
  }

  private setScrollableToolbarHeight(): void {
    if (this.scrollable && this.toolbar && this.scrollContainer) {
      const scrollbarHeight: number =
      this.scrollContainer.nativeElement.offsetHeight - this.scrollContainer.nativeElement.clientHeight;
      const oldHeight: number = this.toolbarHeight;
      this.toolbarHeight = this.toolbar.nativeElement.offsetHeight + scrollbarHeight;
      if (oldHeight !== this.toolbarHeight) {
        this.chRef.detectChanges();
      }
    }
  }
}
