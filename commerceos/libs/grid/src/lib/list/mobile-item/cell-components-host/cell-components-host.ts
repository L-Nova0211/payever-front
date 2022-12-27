import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  Input,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import {  PeDataGridItem, PeDestroyService } from '@pe/common';

interface InputDataInterface {
  item: PeDataGridItem;
  component?: any;
  isGridItem?: boolean;
  isThumbnail?: boolean;
  componentFactory?: ComponentFactory<any>;
}

@Component({
  selector: 'pe-list-mobile-item-component-host',
  template: `<ng-template #container></ng-template>`,
  styleUrls: ['./cell-components-host.scss'],
  providers: [
    PeDestroyService,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileItemCellComponentHostComponent implements AfterViewInit {
  @Input() set inputData(data: InputDataInterface) {
    this.inputData$.next(data);
  }

  @ViewChild('container', { read: ViewContainerRef }) lazyContainer: ViewContainerRef;

  inputData$ = new BehaviorSubject<InputDataInterface>(null);

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
  ) {}

  ngAfterViewInit(): void {
    this.inputData$.pipe(
      filter(d => !!d),
      tap(inputData => {
        if (inputData.item && (inputData?.component || inputData?.componentFactory)) {
          this.lazyContainer.clear();
          let componentFactory: any;

          if (inputData.componentFactory) {
            componentFactory = inputData.componentFactory;
          } else {
            componentFactory = this.componentFactoryResolver.resolveComponentFactory(inputData.component);
          }

          const componentRef: any = this.lazyContainer.createComponent(componentFactory);
          componentRef.instance.item = inputData.item;

          if (!inputData.isGridItem) {
            componentRef.location.nativeElement.setAttribute('class', 'mobile-item');
          }

          if (inputData?.isThumbnail) {
            componentRef.location.nativeElement.setAttribute('class', 'thumbnail-item');
            componentRef.instance.isThumbnail = inputData.isThumbnail;
          }

          this.cdr.detectChanges();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }
}
