import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'peb-svg-fill',
  templateUrl: './svg-fill.component.html',
  styleUrls: ['./svg-fill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSvgFillComponent implements OnChanges {

  @Input() height = 24;
  @Input() width = 24;
  @Input() url: string;
  @Input() scale: number;
  @Input() type = 'original';

  changeData$ = new BehaviorSubject(true);

  svgDOM$ = this.changeData$.pipe(
    map(() => this.url),
    distinctUntilChanged(),
    switchMap((url) => this.matIconRegistry.getSvgIconFromUrl(this.sanitizer.bypassSecurityTrustResourceUrl(url))),
    map(svg => this.sanitizer.bypassSecurityTrustHtml(svg.outerHTML)),
    shareReplay(1),
  );

  scale$ = this.changeData$.pipe(
    map(() => `scale(${this.scale})`),
    distinctUntilChanged(),
    shareReplay(1),
  );

  viewBox$ = this.changeData$.pipe(
    map(() => `${this.width} ${this.height}`),
    distinctUntilChanged(),
    map(() => `0 0 ${this.width} ${this.height}`),
    shareReplay(1),
  );

  type$ = this.changeData$.pipe(
    map(() => this.type),
    distinctUntilChanged(),
    shareReplay(1),
  );

  constructor(
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnChanges(): void {
    this.changeData$.next(true);
  }

}
