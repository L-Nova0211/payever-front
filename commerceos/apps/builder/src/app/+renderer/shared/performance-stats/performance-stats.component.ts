import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { meanBy, round } from 'lodash';

const REPAINT_COUNTER = 10;

@Component({
  selector: 'peb-sandbox-performance-stats',
  templateUrl: 'performance-stats.component.html',
  styleUrls: ['performance-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxPerformanceStatsComponent implements OnInit {
  memoryTotal = 0;
  memoryUsed = 0;

  frameTime = 0;

  private frames = [];

  private prevFrame = Date.now();
  private framesCount = 0;

  private destroyed = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.trackFraming();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  trackFraming() {
    this.framesCount++;
    this.frames.push({
      memoryTotal: (performance as any).memory.totalJSHeapSize / 10 ** 6,
      memoryUsed: (performance as any).memory.usedJSHeapSize / 10 ** 6,
      frameTime: Date.now() - this.prevFrame,
    });
    this.prevFrame = Date.now();
    this.frames = this.frames.slice(-10);

    if (this.framesCount % REPAINT_COUNTER === 0) {
      this.memoryTotal = round(meanBy(this.frames, 'memoryTotal'), 2);
      this.memoryUsed = round(meanBy(this.frames, 'memoryUsed'), 2);
      this.frameTime = meanBy(this.frames, 'frameTime');

      this.cdr.detectChanges();
      this.cdr.markForCheck();
    }

    requestAnimationFrame(() => {
      if (!this.destroyed) {
        this.trackFraming();
      }
    });
  }
}
