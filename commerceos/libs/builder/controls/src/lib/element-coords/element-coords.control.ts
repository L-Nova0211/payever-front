import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';


@Component({
  selector: 'peb-editor-controls-element-coords',
  templateUrl: 'element-coords.control.html',
  styleUrls: ['element-coords.control.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebElementCoordsControl implements OnInit, OnDestroy {

  math = Math;

  @Input()
  scale: number;

  @Input()
  position: { x: number, y: number };

  @HostBinding('style.margin')
  margin: string;

  @Input()
  @HostBinding('style.width.px')
  width = 1200;

  @Input()
  @HostBinding('style.height.px')
  height = 0;

  @Input()
  spaceWidth = 0;

  constructor(
    private elmRef: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.margin = `0 ${this.spaceWidth}px`;
    this.width = this.width - (this.spaceWidth * 2);
  }

  detectChanges() {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    const elm = this.elmRef.nativeElement as HTMLElement;
    elm.parentNode.removeChild(elm);
  }
}
