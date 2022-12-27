import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { BBox } from 'rbush';
import { BehaviorSubject } from 'rxjs';

import { GuidelinePosition } from './guidelines';


export enum MarkerPosition {
  Start = 'start',
  End = 'end',
}


@Component({
  selector: 'peb-editor-controls-guidelines',
  templateUrl: 'guidelines.control.html',
  styleUrls: ['guidelines.control.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebGuidelinesControl implements OnDestroy {

  markerPosition = MarkerPosition;

  get marker(): { markerWidth: number, markerHeight: number, refX: number, refY: number, points: string } {
    return {
      markerWidth: 12 * this.markerScale,
      markerHeight: 10 * this.markerScale,
      refX: 7 * this.markerScale,
      refY: 5 * this.markerScale,
      points: `0 0, ${6 * this.markerScale} ${5 * this.markerScale}, 0 ${10 * this.markerScale}`,
    };
  }

  get markerScale(): number {
    return Math.min(0.75, Math.max(this.scale, 1));
  }

  @Input()
  set guidelines(value: BBox[]) {
    this.guidelinesSubject$.next(value);
  }

  @Input()
  scale: number;

  @Input()
  @HostBinding('style.width.px')
  width = 1200;

  @Input()
  @HostBinding('style.height.px')
  height = 0;

  @Input()
  set spaceWidth(value: number) {
    this.spaceWidthSubject$.next(value);
  }

  private readonly guidelinesSubject$ = new BehaviorSubject<BBox[]>([]);
  readonly guidelines$ = this.guidelinesSubject$.asObservable();

  private readonly spaceWidthSubject$ = new BehaviorSubject<number>(0);
  readonly spaceWidth$ = this.spaceWidthSubject$.asObservable();

  private readonly scaleSubject$ = new BehaviorSubject<number>(0);
  readonly scale$ = this.scaleSubject$.asObservable();

  constructor(private elmRef: ElementRef) {
  }

  getGuidelineWidth(guideline: BBox): number {
    return guideline.minY === guideline.maxY
      ? guideline.maxX - guideline.minX
      : guideline.maxY - guideline.minY;
  }

  getMarkerUrl(i: number, position: MarkerPosition): string {
    return position === MarkerPosition.Start ? `url(#start-${i})` : `url(#end-${i})`;
  }

  getMarkerOrient(guideline: BBox, position: MarkerPosition): number {
    return position === MarkerPosition.Start
      ? guideline.minY === guideline.maxY ? 180 : -90
      : guideline.minY === guideline.maxY ? 0 : 90;
  }

  getPathOffset(guideline: any): number {
    switch (guideline.position) {
      case GuidelinePosition.Left:
        return -0.75;
      case GuidelinePosition.Right:
        return 0.75;
      case GuidelinePosition.Top:
        return -0.75;
      case GuidelinePosition.Bottom:
        return 0.75;
      default:
        return 0;
    }
  }

  makeGuidelinePath(guideline: BBox, position: MarkerPosition): string {
    if (!position) {
      return guideline.minY === guideline.maxY
        ? `m ${guideline.minX * this.scale} ${guideline.minY * this.scale}
           l ${(guideline.maxX - guideline.minX) * this.scale} ${this.getPathOffset(guideline)}`
        : `m ${guideline.minX * this.scale} ${guideline.minY * this.scale}
           l ${this.getPathOffset(guideline)} ${(guideline.maxY - guideline.minY) * this.scale}`;
    }

    if (guideline.minY === guideline.maxY) {
      return position === MarkerPosition.Start
        ? `m ${(guideline.minX * this.scale) + 0.75} ${guideline.minY * this.scale - 10 * this.markerScale}
           l 0 ${20 * this.markerScale}`
        : `m ${(guideline.maxX * this.scale) - 0.75} ${guideline.minY * this.scale - 10 * this.markerScale}
           l 0 ${20 * this.markerScale}`;
    }

    return position === MarkerPosition.Start
      ? `m ${guideline.minX * this.scale - 10 * this.markerScale} ${(guideline.minY * this.scale) + 0.75}
           l ${20 * this.markerScale} 0`
      : `m ${guideline.minX * this.scale - 10 * this.markerScale} ${(guideline.maxY * this.scale) - 0.75}
           l ${20 * this.markerScale} 0`;

  }

  ngOnDestroy(): void {
    const elm = this.elmRef.nativeElement as HTMLElement;
    elm.parentNode.removeChild(elm);
  }
}
