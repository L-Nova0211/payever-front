import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  Component,
  TemplateRef,
  ViewChild,
  ChangeDetectionStrategy,
  ViewContainerRef,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'pe-virtual-scroll-viewport',
  templateUrl: './virtual-scroll-viewport.component.html',
  styleUrls: ['./virtual-scroll-viewport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class VirtualScrollViewportComponent {

  private view: ViewContainerRef;
  public items: any[];
  public itemSize = 50;
  public itemTemplate: TemplateRef<any>;

  @ViewChild('content') content: TemplateRef<object>;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;
  @Output() scrollIndexChange = new EventEmitter<number>();
  @Output() firstItemIndexChange = new EventEmitter<number>();

  constructor(
    private changeDetector: ChangeDetectorRef,
  ) { }

  public attachView(view: ViewContainerRef) {
    if (this.view) {
      return;
    }
    this.view = view;
    this.view.createEmbeddedView(this.content);
  }

  onScrolledIndexChange(data) {
    this.firstItemIndexChange.emit(data);
    if (data <= 10) {
      this.scrollIndexChange.emit(data);
    }
  }
}
