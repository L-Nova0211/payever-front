import { CdkDrag, DragDrop, DragRef } from '@angular/cdk/drag-drop';
import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewContainerRef,
} from '@angular/core';
import { merge, of, Subscription } from 'rxjs';
import { delay, filter, first, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';

import { PebDeviceService, PeDestroyService } from '@pe/common';

import { PreviewContainerComponent } from '../components/preview-container/preview.component';
import { MoveIntoFolderEvent, MoveIntoRootFolderEvent, PeMoveToFolderItem, PreviewType } from '../interfaces/folder.interface';
import { DragAndDropService } from '../services/drag-drop.service';


@Directive({
  selector: '[peDropIntoFolder]',
  providers: [
    PeDestroyService,
  ],
})

export class DropIntoFolderDirective implements OnInit {
  @Input('peDropIntoFolder') dragData: PeMoveToFolderItem[] = [];

  @Output() moveToFolder = new EventEmitter<MoveIntoFolderEvent>();
  @Output() moveToRootFolder = new EventEmitter<MoveIntoRootFolderEvent>();

  private dropSubscription: Subscription;
  private dragItem: DragRef<CdkDrag<any>>;
  private animationCancel = false;

  get animationElement() {
    return this.element.nativeElement;
  }

  @HostListener('click') onClick() {
    this.animationCancel = true;
    this.dragAndDropService.cancelAnimation(this.element);
    setTimeout(() => {
      this.viewContainer.clear();
    }, 100);
  }

  @HostListener('actionClick') onActionClick() {
    this.dragAndDropService.cancelAnimation(this.element);
  }

  @HostListener('preview') onPreview() {
    this.dragAndDropService.cancelAnimation(this.element);
  }

  @HostListener('touchstart') onTouchStart() {
    this.animationCancel = false;
    this.dragAndDropService.cancelAnimation(this.element);
  }

  @HostListener('touchend') onTouchEnd() {
    this.animationCancel = true;
    this.dragAndDropService.cancelAnimation(this.element);
    this.viewContainer.clear();
  }

  @HostListener('touchmove') onTouchMove() {
    this.animationCancel = true;
    this.dragAndDropService.cancelAnimation(this.element);
  }

  constructor(
    protected dragAndDropService: DragAndDropService,
    protected injector: Injector,
    private destroy$: PeDestroyService,
    private deviceService: PebDeviceService,
    protected element: ElementRef,
    private dragDrop: DragDrop,
    private viewContainer: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    if (!this.dragData?.length) {
      console.error('[peDropIntoFolder] No data for drag external!');

      return;
    }

    setTimeout(() => {
      if (!this.deviceService.isMobile) {
        this.initDragDrop();
      }
    })
  }

  private initDragDrop() {
    this.dragItem = this.dragDrop.createDrag(this.element);
    this.dragAndDropService.externalDropList._dropListRef.withItems([this.dragItem]);
    this.dragItem.dragStartDelay = this.dragAndDropService.dndDelay;
    this.dragItem.data = this.dragData as any;

    merge(
      this.dragItem.beforeStarted.pipe(

        switchMap((e) => {
          this.setPreview();
          document.body.classList.add('move-to-folder');

          return of(e).pipe(
            takeWhile(() => !this.animationCancel),
            delay(this.dragAndDropService.dragStartDelay),
            tap(() => {
              if (this.deviceService.deviceInfo.deviceType !== 'desktop') {
                setTimeout(() => {
                  if (!this.animationCancel) {
                    this.dragAndDropService.startAnimation(this.element);
                  }
                })
              }
            })
          )
        })
      ),
      this.dragItem.started.pipe(
        tap(() => {
          this.dragAndDropService.setDragItems(this.dragData);
          this.dragAndDropService.cancelAnimation(this.element);
          this.dragAndDropService.dndDrag$.next();
          this.moveItemSubscribe();
        })
      ),
      this.dragItem.moved.pipe(
        tap((e) => {
          this.dragAndDropService.dndMoved$.next(e);
        })
      ),
      this.dragItem.released.pipe(
        tap(() => {
          this.viewContainer.clear();
          document.body.classList.remove('move-to-folder');
        })
      ),
      this.dragItem.ended.pipe(
        tap(() => {
          this.ngZone.onStable.asObservable().pipe(
            first(),
          ).subscribe(() => {
            this.dragAndDropService.setDragItems([]);
            this.dropSubscription?.unsubscribe();
            this.cdr.markForCheck();
          });
          this.viewContainer.clear();
          document.body.classList.remove('move-to-folder');
        })
      )
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe()
  }

  private moveItemSubscribe(): void {
    this.dropSubscription = merge(
      this.dragAndDropService.dropIntoFolder$.pipe(
        filter(() => !!this.dragAndDropService.dragItems),
        tap(({ folder, excludeItems }) => {
          const excludeIds = excludeItems.reduce((acc, item) => [...acc, item.id], []);
          const moveItems = this.dragData.filter(item => !excludeIds.includes(item.id))
          this.moveToFolder.emit({
            folder,
            moveItems,
          })
        })
      ),
      this.dragAndDropService.dropIntoRootFolder$.pipe(
        filter(() => !!this.dragAndDropService.dragItems),
        tap(({ folder, excludeItems }) => {
          const excludeIds = excludeItems.reduce((acc, item) => [...acc, item.id], []);
          const moveItems = this.dragData.filter(item => !excludeIds.includes(item.id))
          this.moveToRootFolder.emit({
            folder,
            moveItems,
          })
        })
      )
    )
    .subscribe();
  }

  private setPreview(): void {
    let previewTemplate: HTMLElement | string = this.dragAndDropService.dragImagePlaceholder;
    let previewType = PreviewType.ImageSrc;
    /* if (this.deviceService.deviceInfo.deviceType !== 'desktop') {
      this.animationElement
      previewTemplate = <HTMLElement>this.animationElement.cloneNode(true);
      previewType = PreviewType.HTMLElement;

      this.prepareNodeCopyAsDragImage(this.animationElement, previewTemplate);
    } */

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PreviewContainerComponent)
    const previewComponent = this.viewContainer.createComponent<PreviewContainerComponent>(componentFactory);
    previewComponent.instance.setPreview(previewTemplate, previewType);
    let scale = 1;
    let previewStyle = {};
    let boxStyle = {};

    if (
      this.element.nativeElement.offsetWidth > 100
      && this.element.nativeElement.offsetHeight > 100
    ) {
      scale = 100 / this.element.nativeElement.offsetWidth;
    } else if (this.animationElement.localName === 'pe-table-row') {
      boxStyle = {
        width: '200px',
        overflow: 'hidden',
      }
      previewStyle = {
        display: 'grid',
        gridTemplateColumns: getComputedStyle(this.animationElement.parentNode).gridTemplateColumns,
        alignItems: 'center',
      }
    }

    previewComponent.instance.scaleValue = scale;

    const preview = {
      template: previewComponent.instance.previewTemplate,
      context: {
        scale,
        type: previewType,
        previewStyle,
        boxStyle,
        countItems: this.dragData?.length ?? 0,
      },
      matchSize: false,
      viewContainer: this.viewContainer,
    };
    this.dragItem.withPreviewTemplate(preview);
  }

  private prepareNodeCopyAsDragImage(
    srcNode: HTMLElement,
    dstNode: HTMLElement,
  ): void {
    if (srcNode.nodeType === 1) {
      const cssStyles = getComputedStyle(srcNode);

      for (let i = 0; i < cssStyles.length; i++) {
        const csName = cssStyles[i];
        dstNode.style.setProperty(csName, cssStyles.getPropertyValue(csName), cssStyles.getPropertyPriority(csName));
      }

      dstNode.style.setProperty('pointerEvents', 'none');

      // Remove any potential conflict attributes
      dstNode.removeAttribute('id');
      // dstNode.removeAttribute('class');
      dstNode.removeAttribute('draggable');
    }

    // Do the same for the children
    if (srcNode.hasChildNodes()) {
      for (let i = 0; i < srcNode.childNodes.length; i++) {
        this.prepareNodeCopyAsDragImage(<HTMLElement>srcNode.childNodes[i], <HTMLElement>dstNode.childNodes[i]);
      }
    }
  }
}
