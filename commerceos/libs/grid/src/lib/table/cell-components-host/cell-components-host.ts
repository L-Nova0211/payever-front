import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { forIn } from 'lodash-es';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';


import { PeDataGridItem, PeDestroyService } from '@pe/common';

import { PeGridItemColumnData } from '../../misc/interfaces/grid.interface';
import { PeGridViewportService } from '../../viewport';
import { PeGridTableService } from '../table.service';

import { PeGridTableActionCellComponent } from './components/action/action.component';
import { PeGridTableBadgeCellComponent } from './components/badge/badge.component';
import { PeGridTableMoreCellComponent } from './components/more/more.component';
import { PeGridTablePreviewCellComponent } from './components/preview/preview.component';

interface InputDataInterface {
  component: any;
  item: PeDataGridItem;
  componentFactory?: ComponentFactory<any>;
  key?: string;
  data?: PeGridItemColumnData;
  isGridItem?: boolean;
  styles?: {[key: string]: string}
}

@Component({
  selector: 'pe-table-row-cell-component-host',
  template: `<ng-template #container></ng-template>`,
  styleUrls: ['./cell-components-host.scss'],
  providers: [
    PeDestroyService,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponentHostComponent implements AfterViewInit {

  @Input() set inputData(data: InputDataInterface) {
    this.inputData$.next(data);
  }

  @Output() preview = new EventEmitter<PeDataGridItem>();
  @Output() actionClick = new EventEmitter<PeDataGridItem>();
  @Output() moreClick = new EventEmitter<PointerEvent>();

  @ViewChild('container', { read: ViewContainerRef }) lazyContainer: ViewContainerRef;

  inputData$ = new BehaviorSubject<InputDataInterface>(null);

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private tableService: PeGridTableService,
    private render: Renderer2,
    private viewportService: PeGridViewportService,
  ) {}

  ngAfterViewInit(): void {
    combineLatest([
      this.inputData$,
      this.viewportService.isMobile$,
    ]).pipe(
      filter(([d]) => !!d),
      tap(([inputData, isMobile]) => {
        if (inputData.item && (inputData?.component || inputData?.componentFactory)) {
          let componentFactory: any;

          if (inputData.componentFactory) {
            componentFactory = inputData.componentFactory;
          } else {
            componentFactory = this.componentFactoryResolver.resolveComponentFactory(inputData.component);
          }
          this.lazyContainer.clear();
          const componentRef: any = this.lazyContainer.createComponent(componentFactory, null);
          componentRef.instance.item = inputData.item;
          componentRef.instance.key = inputData.key;
          componentRef.instance.data = inputData.data;
          componentRef.location.nativeElement.setAttribute('class', 'pe-cut-overflow-cell');

          this.setCustomStyles(inputData, componentRef.location.nativeElement);

          if (isMobile && !inputData?.isGridItem) {
            componentRef.location.nativeElement.setAttribute('class', 'is-mobile');
          }

          if (inputData?.isGridItem) {
            componentRef.location.nativeElement.setAttribute('class', 'is-list-mobile');
          }

          this.initPreviewListener(componentRef);
          this.initActionListener(componentRef);

          if (componentRef.instance instanceof PeGridTableBadgeCellComponent) {
            this.tableService.hasBadgeButton = true;
          }

          this.cdr.detectChanges();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  initPreviewListener(componentRef: ComponentRef<any>): void {
    if (componentRef.instance instanceof PeGridTablePreviewCellComponent) {
      this.tableService.hasPreviewButton = true;
      componentRef.instance.preview.pipe(
        tap((item: PeDataGridItem) => {
          this.preview.emit(item);
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }

  initActionListener(componentRef: ComponentRef<any>): void {
    if (componentRef.instance instanceof PeGridTableActionCellComponent) {
      this.tableService.hasActionButton = true;
      componentRef.instance.actionClick.pipe(
        tap((item: PeDataGridItem) => {
          this.actionClick.emit(item);
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    } else if (componentRef.instance instanceof PeGridTableMoreCellComponent) {
      this.tableService.hasActionButton = true;
      componentRef.instance.actionClick.pipe(
        tap((item) => {
          this.moreClick.emit(item);
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }

  private setCustomStyles(inputData: InputDataInterface, nativeElement): void {
    if (inputData?.styles) {
      forIn(inputData?.styles, (value, key) => {
        this.render.setStyle(nativeElement, key, value);
      });
    }
  }
}
