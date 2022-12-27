import { AnimationPlayer, AnimationMetadata, style, animate, AnimationBuilder } from '@angular/animations';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { PebDeviceService } from '@pe/common';

import { FolderItem, PeMoveToFolderItem, RootFolderItem } from '../interfaces/folder.interface';

@Injectable()

export class DragAndDropService {

  dragItems: PeMoveToFolderItem[] = [];
  dragDropStart$ = new BehaviorSubject<PeMoveToFolderItem[]>([]);

  readonly dropIntoFolder$ = new Subject<{
    folder: FolderItem,
    excludeItems: PeMoveToFolderItem[]
  }>();

  readonly dropIntoRootFolder$ = new Subject<{
    folder: RootFolderItem,
    excludeItems: PeMoveToFolderItem[]
  }>();

  readonly dndDrag$ = new Subject<void>();
  readonly dndMoved$ = new Subject<any>();
  readonly dragStartDelay = 700;

  externalDropList: CdkDropList;

  private player: AnimationPlayer;

  get dragImagePlaceholder() {
    return 'assets/icons/drag-image.svg';
  }

  get dndDelay() {
    if (this.deviceService.deviceInfo.deviceType === 'desktop') {
      return 0;
    }

    return this.dragStartDelay;
  }

  constructor(
    private builder: AnimationBuilder,
    private deviceService: PebDeviceService
  ) {
  }

  setDragItems(items: PeMoveToFolderItem[]): void {
    this.dragItems = items;
    if (items?.length) { this.dragDropStart$.next(items); }
  }

  startAnimation(animationElement: ElementRef) {
    this.dragAnimation(true, animationElement.nativeElement);
  }

  cancelAnimation(animationElement: ElementRef) {
    this.dragAnimation(false, animationElement.nativeElement);
  }

  private dragAnimation(ready: boolean, animationElement) {
    if (this.player) {
      this.player.destroy();
    }

    const metadata = ready ? this.start() : this.cancel();
    const factory = this.builder.build(metadata);
    const player = factory.create(animationElement);

    player.play();
  }

  private start(): AnimationMetadata[] {
    return [
      style({ transform: 'scale(1)' }),
      animate('10ms ease-in', style({
        transform: 'scale(1.05)',
      })),
    ];
  }

  private cancel(): AnimationMetadata[] {
    return [
      style({ transform: '*' }),
      animate('10ms ease-in', style({
        transform: 'scale(1)',
      })),
    ];
  }
}
