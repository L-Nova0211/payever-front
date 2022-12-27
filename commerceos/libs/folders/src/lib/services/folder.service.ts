import { Inject, Injectable } from '@angular/core';
import flatten from 'lodash/flatten';
import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { EnvironmentConfigInterface, MessageBus, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { FolderApply, FolderItem } from '../interfaces/folder.interface';

@Injectable()
export class FolderService {
  readonly folderIntoFolder$ = new Subject<{moveId: string, intoId: string}>();
  readonly creatingFolder$ = new Subject<boolean>();
  readonly creatingHeadline$ = new Subject<boolean>();
  readonly deleteFolder$ = new Subject<string>();
  readonly deleteNode$ = new Subject<string>();
  readonly renameFolder$ = new Subject<string>();
  readonly duplicateFolder$ = new Subject<string>();
  readonly updateFolder$ = new Subject<FolderApply>();
  readonly addFolder$ = new Subject<FolderApply>();

  public readonly confirmation$ = this.messageBus.listen<boolean>('confirm').pipe(share());
  public selectedFolder: FolderItem;

  folderPlaceholder: string;
  headlinePlaceholder: string;
  nextPosition = 0;
  rootFolder: FolderItem = {
    _id: null,
    image: 'assets/icons/folder.svg',
    children: [],
    name: this.translateService.translate('coupons-app.folders.all_coupons'),
    position: null,
  };

  private dragImg: HTMLImageElement;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private messageBus: MessageBus,
    private translateService: TranslateService
  ) {
    this.dragImg = new Image();
    this.dragImg.src = `${this.env.custom.cdn}/icons-folders/drag-image.png`;
  }

  get dragImagePlaceholder(): HTMLImageElement {
    return this.dragImg;
  }

  public backdropClick = () => {};

  public createFolder(placeholder: string) {
    this.folderPlaceholder = placeholder;
    this.creatingFolder$.next(true);
  }

  public createHeadline(placeholder: string) {
    this.headlinePlaceholder = placeholder;
    this.creatingHeadline$.next(true);
  }

  private flatFoldersTree(folders: FolderItem[]): FolderItem[] {
    return folders.some(folder => folder?.children && folder.children.length)
      ? [...folders, ...this.flatFoldersTree(flatten(folders.map(folder => folder?.children ?? [])))]
      : folders;
  }

  public getFolderFromTreeById(foldersTree: FolderItem[], folderId: string, rootFolder?: FolderItem): FolderItem {
    const folders = this.flatFoldersTree(foldersTree);
    const folder = folders.find(folder => folder._id === folderId);

    return folder
      ? folder
      : rootFolder ?? {
          _id: null,
          children: [],
          name: 'root',
          position: null,
        } as FolderItem;
  }

  public setDragImage(imageUrl: string) {
    this.dragImg.src = imageUrl;
  }
}
