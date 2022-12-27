import { AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit } from '@angular/core';
import { curveBasis } from 'd3-shape';
import { fromEvent } from 'rxjs';

import { AppThemeEnum, EnvService } from '@pe/common';

import { AbstractWidgetDirective } from '../abstract.widget';
import { MOCK_DATA } from '../mock.data';





@Component({
  selector: 'peb-line-graph',
  templateUrl: './line-graph.component.html',
  styleUrls: ['./line-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineGraphComponent extends AbstractWidgetDirective implements OnInit, AfterViewInit {
  /** Default view size */
  @Input() view: number[] = [158, 57];

  /** Whether widget is resizable */
  @Input() resizable = false;

  /** Selected theme */
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  /** Binds selected theme class */
  @HostBinding('class') class = `${this.theme}-widget`;

  /** Line graph data */
  lineGraphData = null;

  /** Hides graph legend */
  legend = false;

  /** Hides graph x axis */
  xAxis = false;

  /** Hides graph y axis */
  yAxis = false;

  /** Curve fit function */
  curve: any = curveBasis;

  /** Curve color */
  colorScheme = {
    domain: ['#00f67d'],
  };

  constructor(private envService: EnvService, private elRef: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    if (!this.config?.dataSource[1][1]) {
      this.lineGraphData = MOCK_DATA.LineGraph[1][1];
    }
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    if (this.resizable) {
      this.setGraphWidth();
      fromEvent(window, 'resize').subscribe(() => {
        this.setGraphWidth();
      });
    }
  }

  /** Sets dynamic graph width depending if its resizable */
  setGraphWidth() {
    const graphWidth = this.elRef.nativeElement.getBoundingClientRect().width + 40;
    this.view = [graphWidth, this.view[1]];
    this.cdr.detectChanges();
  }
}
