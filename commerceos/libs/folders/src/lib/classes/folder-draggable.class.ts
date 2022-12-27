import { CdkDragEnter, CdkDragMove } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Injector } from '@angular/core';
import { throttle } from 'lodash-es'
import { merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService, PeGridItemType } from '@pe/common';

import { DragAreaTypes, FolderItem, RootFolderItem } from '../interfaces/folder.interface';
import { DragAndDropService } from '../services/drag-drop.service';

import { FolderItemFlatNode } from './folder-item.class';
import { FolderTree } from './folder-tree.class';

export class FolderTreeDraggable extends FolderTree {

  private dragNodeExpandOverNode: FolderItem;
  private readonly dragNodeExpandOverWaitTimeMs = 500;
  private dragNodeExpandOverTime: number;
  private enteredElementBoundary: DOMRect;
  private enteredNode: FolderItemFlatNode;
  private rootEnteredNode: RootFolderItem;
  private debounceMove = throttle((e) => {
    const { x, y, width, height } = this.enteredElementBoundary;
    const { x: pointX, y: pointY } = e.pointerPosition;
    if ((pointX >= x && pointX <= x + width) && (pointY >= y && pointY <= y + height)) {
      const percentageY = (pointY - y) / height;

      if (!Number.isNaN(percentageY)) {
        if (this.enteredNode) {
          this.handleDragOver(percentageY, this.enteredNode);
        } else if (this.rootEnteredNode) {
          this.handleRootDragOver(percentageY, this.rootEnteredNode);
        }
      }
    } else {
      this.dragNodeExpandOverArea = null;
      this.dragNodeExpandOverNode = null;
      this.cdr.detectChanges();
    }
  }, 10, { leading: true, trailing: true });

  enableAboveArea = true;
  enableCenterArea = true;
  enableBelowArea = true;
  dragNodeExpandOverArea: DragAreaTypes;
  dragNode: FolderItemFlatNode;
  startMove$ = new Subject<void>();

  protected dragAndDropService = this.injector.get(DragAndDropService);
  protected destroy$: PeDestroyService = this.injector.get(PeDestroyService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);

  get isDragging(): boolean {
    return !!(this.dragNode || this.dragAndDropService.dragItems?.length);
  }

  constructor(
    public injector: Injector,
  ) {
    super(injector);

    merge(
      this.dragAndDropService.dndMoved$.pipe(
        tap((e) => this.onDragMoved(e))
      ),
      this.dragAndDropService.dndDrag$.pipe(
        tap(() => {
          this.enteredNode = null;
          this.rootEnteredNode = null;
        })
      )
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe()
  }

  onRootEnteredList(e: CdkDragEnter, node: RootFolderItem) {
    this.dragNode = null;
    this.enteredNode = null;
    this.rootEnteredNode = node;
    this.enteredElementBoundary = e.container.element.nativeElement.getBoundingClientRect();
  }

  onEnteredList(e: CdkDragEnter, node: FolderItemFlatNode): void {
    this.rootEnteredNode = null;
    this.enteredNode = node;
    this.enteredElementBoundary = e.container.element.nativeElement.getBoundingClientRect();
  }

  onDragMoved(e: CdkDragMove): void {
    this.startMove$.next();
    if (!this.enteredElementBoundary) {
      return
    }

    this.debounceMove(e);
  }

  dragRootNodeAreaType() {
    return this.dragNodeExpandOverArea === DragAreaTypes.Center && this.rootEnteredNode ? 'drop-center' : '';
  }

  dragNodeAreaType(node: FolderItem): string {
    const isEqualNodes = this.dragNodeExpandOverNode === node;
    if (this.dragNodeExpandOverArea === DragAreaTypes.Above && isEqualNodes) {
      return 'drop-above';
    } else if (this.dragNodeExpandOverArea === DragAreaTypes.Below && isEqualNodes) {
      return 'drop-below';
    } else if (this.dragNodeExpandOverArea === DragAreaTypes.Center && isEqualNodes) {
      return 'drop-center';
    }

  }

  handleDragStart(node: FolderItemFlatNode): void {
    this.rootEnteredNode = null;
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleRootDragOver(percentageY: number, node: RootFolderItem): void {
    this.dragRootExternalOver(percentageY, node);
  }

  handleDragOver(percentageY: number, node: FolderItemFlatNode): void {
    if (node?.isProtected) {
      return;
    }

    if (this.dragNode) {
      this.dragNodeOver(percentageY, node);
    } else {
      this.dragExternalOver(percentageY, node);
    }
  }

  handleDrop(node: FolderItemFlatNode): void {
    if (node.isProtected) {
      return;
    }

    if (this.dragNode) {
      this.nodeDrop(node);
    } else {
      this.externalDrop(node);
    }
  }

  handleRootDrop(node: RootFolderItem) {
    this.externalRootDrop(node);
  }

  handleDragEnd(): void {
    this.dragNode = null;
    this.dragNodeExpandOverArea = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  private externalDrop(node: FolderItemFlatNode): void {
    if (this.dragAndDropService.dragItems?.length && this.dragNodeExpandOverArea !== null) {
      const excludeItems = this.dragAndDropService.dragItems.filter(
        item => (item.type === PeGridItemType.Folder && node._id === item?.id)
          || (item.type === PeGridItemType.Item && node.isHeadline)
      );

      this.dragAndDropService.dropIntoFolder$.next({
        folder: node,
        excludeItems,
      });
    }

    this.dragNodeExpandOverArea = null;
    this.dragNodeExpandOverTime = 0;
  }

  private externalRootDrop(node: RootFolderItem): void {
    if (this.dragAndDropService.dragItems?.length && this.dragNodeExpandOverArea !== null) {
      const excludeItems = this.dragAndDropService.dragItems.filter(
        item => (item.type === PeGridItemType.Folder)
      );

      this.dragAndDropService.dropIntoRootFolder$.next({
        folder: node,
        excludeItems,
      });
    }

    this.dragNodeExpandOverArea = null;
    this.dragNodeExpandOverTime = 0;
  }

  private nodeDrop(node: FolderItemFlatNode): void {
    if (node !== this.dragNode) {
      const dragNode = this.flatNodeMap.get(this.dragNode);
      const nestedNode = this.flatNodeMap.get(node);

      if (this.dragNodeExpandOverArea !== null) {
        let newItem: FolderItem;
        this.folderDatabase.setResetState();
        this.folderDatabase.deleteItem(dragNode, false);

        if (this.dragNodeExpandOverArea === DragAreaTypes.Above) {
          newItem = this.folderDatabase.copyPasteItemAbove(dragNode, nestedNode);
        } else if (this.dragNodeExpandOverArea === DragAreaTypes.Below) {
          newItem = this.folderDatabase.copyPasteItemBelow(dragNode, nestedNode);
        } else if (this.dragNodeExpandOverArea === DragAreaTypes.Center) {
          newItem = this.folderDatabase.copyPasteItemInto(dragNode, nestedNode);
        }

        if (this.dragNodeExpandOverArea === DragAreaTypes.Center) {
          if (!this.treeControl.isExpanded(node)) {
            this.treeControl.expand(node);
          }
        }

        this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
      }
    }

    this.handleDragEnd();
  }

  private dragRootExternalOver(percentageY: number, node: RootFolderItem): void {
    if (
      this.dragAndDropService.dragItems.length == 1
      && this.dragAndDropService.dragItems[0].type === PeGridItemType.Folder
    ) {

      return;
    }

    if ((this.dragAndDropService.dragItems.some(item => item.type === PeGridItemType.Item))
      && percentageY > 0 && percentageY < 1
    ) {
      this.dragNodeExpandOverArea = DragAreaTypes.Center;
      this.cdr.detectChanges();
    }
  }

  private dragExternalOver(percentageY: number, node: FolderItemFlatNode): void {
    if (
      this.dragAndDropService.dragItems.length == 1
      && (this.dragAndDropService.dragItems[0].id === node._id
        || (node.isHeadline && this.dragAndDropService.dragItems[0].type === PeGridItemType.Item))
    ) {
      return;
    }

    this.toggleExpand(node);

    if ((
      !node?.isHeadline
      || (node?.isHeadline && this.dragAndDropService.dragItems.some(item => item.type === PeGridItemType.Folder)))
      && percentageY > 0 && percentageY < 1
    ) {
      this.dragNodeExpandOverArea = DragAreaTypes.Center;
      this.cdr.detectChanges();
    }
  }

  private dragNodeOver(percentageY: number, node: FolderItemFlatNode): void {
    const isMoveToArea = (this.dragNode?.isHeadline && node.level === 0) || !this.dragNode?.isHeadline;
    const isMoveToCenterArea = !this.dragNode?.isHeadline && this.dragNode?._id != node?._id;

    if (node._id == this.dragNode._id) {
      return;
    }

    if (this.dragNode?.isHeadline && node.parentIsHeadline) {
      const parent = this.getFlatNodeById(node._id);
      const nestedNode = this.nestedNodeMap.get(parent);
      this.toggleExpand(nestedNode, false);
    } else {
      this.toggleExpand(node);
    }

    if (this.enableAboveArea && isMoveToArea && percentageY < 0.25) {
      this.dragNodeExpandOverArea = DragAreaTypes.Above;
    } else if (this.enableCenterArea && isMoveToCenterArea && percentageY > 0.25 && percentageY < 0.75) {
      this.dragNodeExpandOverArea = DragAreaTypes.Center;
    } else if (this.enableBelowArea && isMoveToArea && percentageY > 0.75) {
      this.dragNodeExpandOverArea = DragAreaTypes.Below;
    } else {
      this.dragNodeExpandOverArea = null;
    }

    this.cdr.detectChanges();
  }

  private toggleExpand(node: FolderItemFlatNode, expand: boolean = true): void {
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          if (node?.expandable && expand) {
            // this.treeControl.expand(node);
            this.cdr.markForCheck();
          }
        }
      } if (!expand) {
        this.treeControl.collapse(node);
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }
  }
}

