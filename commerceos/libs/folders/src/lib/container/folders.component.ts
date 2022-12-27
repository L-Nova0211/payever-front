import { CdkDropList } from '@angular/cdk/drag-drop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Injector,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import cloneDeep from 'lodash/cloneDeep';
import { merge, of } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  first,
  takeUntil,
  tap,
} from 'rxjs/operators'

import {
  AppThemeEnum,
  AppType,
  APP_TYPE,
  EnvironmentConfigInterface,
  EnvService,
  PebDeviceService,
  PeDestroyService,
  PeGridItemType,
  PE_ENV,
  PreloaderState,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService, TranslationLoaderService } from '@pe/i18n';
import { ThemeSwitcherService } from '@pe/theme-switcher';

import { FolderTreeDraggable } from '../classes/folder-draggable.class';
import { PeFoldersSidenavClass } from '../classes/folders-sidenav.class';
import { FolderItemFlatNode } from '../classes/folder-item.class';
import { OVERLAY_POSITIONS } from '../constant';
import { PeFoldersContextMenuEnum } from '../enums/folders.enum';
import {
  DragAreaTypes,
  FolderApply,
  FolderItem,
  FolderOutputEvent,
  FolderPosition,
  PeMoveToFolderItem,
  RootFolderItem,
} from '../interfaces/folder.interface';

@Component({
  selector: 'pe-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss'],
  providers: [
    PeDestroyService,
  ],
})

export class PeFolderComponent extends FolderTreeDraggable implements OnInit, OnChanges, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  @Input() disableSkeleton = false;
  @Input() enableMarkAsActive = true;

  @Input() set folders(folders: FolderItem[]) {
    this.folderDatabase.initialize(folders ?? []);
    this.checkDefaultSelectFolder();
  };

  @Input() set selectFolder(folder: FolderItem) {
    if (this.isHandleSelect) {
      this.isHandleSelect = false;

      return;
    }

    if (folder) {
      this.selectedItem = folder;
      this.isSelectedRootItem = false;

      this.expandChildNode(folder);
    }
    else {
      this.selectedItem = null;
      this.isSelectedRootItem = true;
    }

  };

  @Input() rootFolder: RootFolderItem = null;
  @Input() defaultFolderIcon = `${this.env.custom.cdn}/icons-transactions/folder.svg`;
  @Input() enableMoveAreas: DragAreaTypes[] = [];
  @Input() sideNav: PeFoldersSidenavClass;
  @Input() embedMode: boolean;
  @Input() isLoading = false;
  @Input() openActionLabel: string;

  @Output() selectedFolder = new EventEmitter<FolderItem>();
  @Output() selectedDefaultFolder = new EventEmitter<FolderItem>();
  @Output() selectedRootFolder = new EventEmitter<RootFolderItem>();
  @Output() createHeadline = new EventEmitter<FolderOutputEvent>();
  @Output() updateHeadline = new EventEmitter<FolderOutputEvent>();
  @Output() openFolder = new EventEmitter<FolderOutputEvent>();
  @Output() createFolder = new EventEmitter<FolderOutputEvent>();
  @Output() updateFolder = new EventEmitter<FolderOutputEvent>();
  @Output() deleteHeadline = new EventEmitter<FolderOutputEvent>();
  @Output() deleteFolder = new EventEmitter<FolderOutputEvent>();
  @Output() positionsChanged = new EventEmitter<FolderPosition[]>();

  @ViewChild('folderCreating') folderCreating: ElementRef;
  @ViewChild('headlineCreating') headlineCreating: ElementRef;
  @ViewChild('externalDropList') set externalList(externalDropList: CdkDropList) {
    if (externalDropList) {
      this.dragAndDropService.externalDropList = externalDropList;
    }
  }

  theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  selectedItem: FolderItem = null;
  focusedNode: FolderItemFlatNode = null;
  isSelectedRootItem = false;

  isCopied = false;
  isFolderContextMenu = false;
  isEnablePaste = true;
  isMobileWidth = false;
  isHandleSelect = false;
  isCreating = false;

  PeFoldersContextMenuEnum = PeFoldersContextMenuEnum;

  private overlayRef: OverlayRef;
  private copyFolder: FolderItem = null;

  get folders(): FolderItem[] {
    return this.dataSource.data;
  }

  get folderPlaceholder(): string {
    return this.folderService.folderPlaceholder || '';
  }

  get headlinePlaceholder(): string {
    return this.folderService.headlinePlaceholder || '';
  }

  get isProtectFolder(): boolean {
    return this.focusedNode?.isProtected;
  }

  get dndDelay(): number {
    return this.dragAndDropService.dndDelay;
  }

  get isGlobalLoading(): boolean {
    return (!this.appType || this.disableSkeleton) ? false : this.loading[this.appType]
  }

  @HostListener('resize') onResize() {
    this.checkClientWidth();
  }

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private envService: EnvService,
    public destroy$: PeDestroyService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    public cdr: ChangeDetectorRef,
    public injector: Injector,
    private translationLoaderService: TranslationLoaderService,
    private ngZone: NgZone,
    private confirmScreenService: ConfirmScreenService,
    private translateService: TranslateService,
    public deviceService: PebDeviceService,
    private themeSwitcherService: ThemeSwitcherService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    super(injector);
    this.matIconRegistry.addSvgIcon(
      'arrow-down-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-filter/arrow-down-icon.svg`),
    );
  }

  ngOnInit(): void {
    this.initTranslations();
    this.checkClientWidth();
    this.themeSwitcherService.changeTheme(this.theme);

    const themeChanges$ = this.themeSwitcherService.theme$.pipe(
      tap((theme) => {
        this.theme = theme;
        this.cdr.markForCheck();
      }),
    );

    merge(
      themeChanges$,
      this.startMove$.pipe(
        filter(() => !!this.overlayRef?.overlayElement),
        tap(() => {
          this.overlayRef?.dispose();
        })
      ),
      this.dragAndDropService.dragDropStart$.pipe(
        tap((items: PeMoveToFolderItem[]) => {
          if (!items?.length) {
            return;
          }

          items.forEach(item => {
            if (item.type == PeGridItemType.Folder) {
              const folder = this.getFlatNodeById(item.id);
              if (folder) {
                this.treeControl.collapse(this.nestedNodeMap.get(folder));
              }
            }
          });
        })
      ),
      this.folderService.creatingFolder$.pipe(
        tap(() => {
          this.createEmptyFolder();
        })
      ),
      this.folderService.creatingHeadline$.pipe(
        tap(() => {
          this.createEmptyHeadline();
        })
      ),
      this.folderDatabase.nodeChange$.pipe(
        tap((folder: FolderItem) => {
          if (folder) {
            const apply = (folder: FolderApply) => {
              if (!folder) {
                this.folderDatabase.resetState();
              }
            };

            if (folder?.isHeadline) {
              this.updateHeadline.emit({ data: folder, apply })
            } else {
              this.updateFolder.emit({ data: folder, apply });
            }
          }
        })
      ),
      this.folderDatabase.deleteNode$.pipe(
        tap((folder: FolderItem) => {
          if (folder) {
            const flatNode = this.nestedNodeMap.get(folder);
            this.flatNodeMap.delete(flatNode);
            this.nestedNodeMap.delete(folder);
          }
        })
      ),
      this.positionChanged$.pipe(
        tap((positions: FolderPosition[]) => {
          this.positionsChanged.emit(positions);
        })
      ),
      this.folderService.folderIntoFolder$.pipe(
        tap(({ intoId, moveId }: { moveId: string, intoId: string }) => {
          if (intoId == moveId) {
            console.warn('You cannot embed a folder in itself!');

            return;
          }

          if (intoId && moveId) {
            const intoNode = this.getFlatNodeById(intoId);
            const moveNode = this.getFlatNodeById(moveId);
            const nestedNode = this.nestedNodeMap.get(intoNode);
            this.folderDatabase.deleteItem(moveNode, false);
            this.folderDatabase.copyPasteItemInto(moveNode, intoNode);

            if (!this.treeControl.isExpanded(nestedNode)) {
              this.treeControl.expand(nestedNode);
            }
          }
        })
      ),
      this.folderService.deleteFolder$.pipe(
        tap((folderId: string) => {
          const flatFolder = this.getFlatNodeById(folderId);
          this.removeFolder(flatFolder);
        })
      ),
      this.folderService.deleteNode$.pipe(
        tap((folderId: string) => {
          const node = this.getFlatNodeById(folderId);
          this.folderDatabase.deleteItem(node);
          if (this.selectedItem?._id === node._id) {
            this.selectedItem = null;
            this.checkDefaultSelectFolder();
          }
        })
      ),
      this.folderService.renameFolder$.pipe(
        tap((folderId: string) => {
          const findEditNode = (data: FolderItem[], parent: FolderItem): FolderItem[] => {
            let found = false;
            let node: FolderItem = null;
            data = data.map(item => {
              if (item._id === folderId) {
                found = true;
                node = item;

                return {
                  ...item,
                  editing: true,
                }

              } else if (item.children.length) {
                item.children = findEditNode(item.children, item);
                found = false;
              }

              return item;
            });

            if (found && node) {
              this.expandChildNode(node);

              setTimeout(() => {
                this.folderCreating?.nativeElement.focus();
              });
            }

            return data;
          }

          this.dataSource.data = findEditNode(this.dataSource.data, null);

        })
      ),
      this.folderService.duplicateFolder$.pipe(
        tap((folderId: string) => {
          const flatFolder = this.getFlatNodeById(folderId);
          this.duplicateFolder(flatFolder);
        })
      ),
      this.folderService.updateFolder$.pipe(
        tap((mewFolder: FolderApply) => {
          const folder = this.getFlatNodeById(mewFolder._id);
          this.folderDatabase.updateAfterInsert({ ...folder, ...mewFolder }, mewFolder._id);
        })
      ),
      this.folderService.addFolder$.pipe(
        tap((mewFolder: FolderApply) => {
          const folder = {
            ...mewFolder,
            position: this.nextPosition,
          };
          let parent = this.getFlatNodeById(mewFolder?.parentFolderId) ?? null;

          this.folderDatabase.addFolder(parent, folder as FolderItem);
        })
      )
    ).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.closeContextMenu();
        this.confirmScreenService.destroy();
      }),
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { enableMoveAreas } = changes;

    this.expandNodeOneTimeWhenInitialized();

    if (enableMoveAreas?.currentValue) {
      this.enableAboveArea = enableMoveAreas?.currentValue.includes(DragAreaTypes.Above);
      this.enableCenterArea = enableMoveAreas?.currentValue.includes(DragAreaTypes.Center);
      this.enableBelowArea = enableMoveAreas?.currentValue.includes(DragAreaTypes.Below);
    }
  }

  expandNodeOneTimeWhenInitialized() {
    this.treeControl.dataNodes.forEach(node => node.isExpanded ? this.treeControl.expand(node) : null);
  }

  nodeToggle(e: Event, node: FolderItemFlatNode): void {
    e.stopPropagation();

    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
    } else {
      this.treeControl.expand(node);
    }
  }

  checkDefaultSelectFolder(force = true): void {
    if (this.selectedItem && force) {
      this.selectedFolder.emit(this.selectedItem);

      return;
    }
    if (this.rootFolder && force) {
      this.isSelectedRootItem = true;
      this.selectedRootFolder.emit(this.selectedItem);
    } else if (this.folders?.length) {
      if (this.folders[0]?.children?.length) {
        this.setDefaultFolder(this.folders[0].children[0]);
      } else if (this.folders[0]?._id) {
        this.setDefaultFolder(this.folders[0]);
      }
    }
  }

  clickEditNode(e: CustomEvent): void {
    e.stopPropagation();
    e.preventDefault();
  }

  nodeSelect(node: FolderItemFlatNode): void {
    if ((!node?.isHeadline && this.selectedItem?._id !== node._id) || (!node?.isHeadline && this.isMobileWidth)) {
      this.selectedItem = this.flatNodeMap.get(node);
      this.isSelectedRootItem = false;
      this.sideNav?.close();
      this.isHandleSelect = true;

      this.selectedFolder.emit(this.selectedItem);
    }
  }

  rootNodeSelect(rootFolder: RootFolderItem): void {
    if (!this.isSelectedRootItem || this.isMobileWidth) {
      this.sideNav?.close();
      this.selectedRootFolder.emit(rootFolder);
    }
    this.isSelectedRootItem = true;
    this.selectedItem = null;
  }

  onCreateFolder(node: FolderItemFlatNode, name: string): void {
    const newFolder = this.flatNodeMap.get(node);
    this.applyNode(node, name, () => {
      const folder = { ...newFolder, name: name.trim() };

      if (node.editing) {
        this.isCreating = true;
        this.folderDatabase.updateItem(folder, name);
        this.updateFolder.emit({
          data: folder,
          apply: (editFolder: FolderApply) => {
            if (!editFolder) {
              this.folderDatabase.resetState();

              return;
            }
            const node = this.getFlatNodeById(editFolder._id);
            node.name = name;
          },
        });
        this.isCreating = false;
      } else {
        if (!this.isCreating) {
            this.isCreating = true;
            this.createFolder.emit({
            data: folder,
            apply: (newFolder: FolderApply) => {
              if (newFolder) {
                this.applyFolderId = newFolder._id;
                this.folderDatabase.updateAfterInsert({ ...folder, ...newFolder }, folder._id);
              } else {
                this.folderDatabase.deleteItem(folder);
              }
              this.isCreating = false;
            },
          });
        }
      }
    });
  }

  onCreateHeadline(node: FolderItemFlatNode, name: string): void {
    const newHeadline = this.flatNodeMap.get(node);
    this.applyNode(node, name, (applyNode: FolderItem) => {
      const headline = { ...newHeadline, name };
      this.emptyFolderId = headline._id;

      if (node.editing) {
        this.updateHeadline.emit({
          data: headline,
          apply: (folder: FolderApply) => {
            if (!folder) {
              this.folderDatabase.resetState()
            }
          },
        });
      } else {
        if (!this.isCreating) {
          this.createHeadline.emit({
            data: headline,
            apply: (newHeadline: FolderApply) => {
              if (newHeadline) {
                this.applyFolderId = newHeadline._id;
                this.folderDatabase.updateAfterInsert({ ...headline, ...newHeadline }, headline._id);
              } else {
                this.folderDatabase.deleteItem(headline);
              }
              this.isCreating = false;
            },
          });
        }
        this.isCreating = true;
      }
    });
  }

  onContextMenuNode(e: any, node: FolderItemFlatNode, context: TemplateRef<any>): void {
    e?.preventDefault();
    e?.stopPropagation();

    if (node.isProtected || node.isHideMenu) {
      return;
    }

    this.isEnablePaste = this.copyFolder?._id !== node._id;
    this.isFolderContextMenu = !node.isHeadline;
    this.focusedNode = node;
    this.createContextMenuOverlay(e, context);
  }

  handleCreateHeadline(): void {
    this.createEmptyHeadline();
    this.closeContextMenu();
  }

  handleCreateFolder(): void {
    this.createEmptyFolder(true);
    this.expandNode(this.focusedNode);

    this.closeContextMenu();
  }

  handleOpenNode(): void {
    this.openFolder.emit({
      data: this.focusedNode,
      apply: (folder: FolderApply) => {
        if (!folder) {
          this.folderDatabase.resetState();
        }
      },
    });
    this.closeContextMenu(false);
  }

  handleEditNode(): void {
    this.focusedNode.editing = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      if (this.focusedNode.isHeadline) {
        this.headlineCreating.nativeElement.focus();
      } else {
        this.folderCreating.nativeElement.focus();
      }
      this.closeContextMenu();
    }, 0);
  }

  handleCopyFolder(): void {
    this.isCopied = true;
    this.copyFolder = cloneDeep(this.focusedNode);
    this.copyFolder._id = this.folderDatabase.generateId();
    this.closeContextMenu();
  }

  handlePastFolder(): void {
    if (this.isEnablePaste) {
      this.emptyFolderId = this.copyFolder._id;
      const newFolder: FolderItem = this.folderDatabase.insertItemInto(
        this.flatNodeMap.get(this.focusedNode),
        {
          ...this.copyFolder,
          name: this.checkName(this.copyFolder.name),
          position: this.nextPosition,
        },
        true
      );

      if (this.focusedNode.isHeadline) {
        newFolder.headlineId = this.focusedNode._id;
      } else {
        newFolder.parentFolderId = this.focusedNode._id;
      }
      this.createFolder.emit({
        data: newFolder,
        apply: (folder: FolderApply) => {
          if (folder) {
            this.applyFolderId = folder._id;
            this.folderDatabase.updateAfterInsert({ ...newFolder, ...folder }, newFolder._id);
          } else {
            this.folderDatabase.deleteItem(newFolder);
          }
        },
      });

      this.expandNode(this.focusedNode);
      this.copyFolder = null;
      this.isCopied = false;
      this.closeContextMenu();
    }
  }

  handleDuplicateFolder(): void {
    this.duplicateFolder(this.focusedNode);
    this.closeContextMenu();
  }

  handleDeleteNode(): void {
    const node = cloneDeep(this.focusedNode);
    this.removeFolder(node);
    this.closeContextMenu();
  }

  isShowItemMenu(item): boolean {
    return this.focusedNode.menuItems.includes(item);
  }

  ngOnDestroy(): void {
    this.flatNodeMap.clear();
    this.nestedNodeMap.clear();
    this.dataSource.data = [];
    this.cdr.detectChanges();
    this.folderDatabase.deleteNode$.next(null);
    this.folderDatabase.nodeChange$.next(null);
  }

  private duplicateFolder(node: FolderItem): void {
    const newId = this.folderDatabase.generateId();
    this.emptyFolderId = newId;
    const newFolder = this.folderDatabase.duplicate(node, {
      ...node,
      _id: newId,
      name: this.checkName(node.name),
      position: this.nextPosition,
    });

    this.createFolder.emit({
      data: newFolder,
      apply: (folder: FolderApply) => {
        if (folder) {
          this.applyFolderId = folder._id;
          this.folderDatabase.updateAfterInsert({ ...newFolder, ...folder }, newFolder._id);
        } else {
          this.folderDatabase.deleteItem(newFolder);
        }
      },
    });
  }

  private removeFolder(node: FolderItem): void {
    const headings: Headings = {
      title: this.translateService.translate('folders.confirm_dialog.delete.folder.title'),
      subtitle: this.translateService.translate('folders.confirm_dialog.delete.folder.subtitle'),
      confirmBtnText: this.translateService.translate('folders.confirm_dialog.buttons.delete'),
      declineBtnText: this.translateService.translate('folders.confirm_dialog.buttons.cancel'),
    }
    const confirmDialog = this.confirmScreenService.show(headings, true);
    confirmDialog.pipe(
      tap(confirm => {
        if (confirm) {
          const apply = (folder: FolderApply) => {
            if (folder) {
              this.folderDatabase.deleteItem(node);
              if (this.selectedItem?._id === node._id) {
                this.selectedItem = null;
                this.checkDefaultSelectFolder();
              }
            }
          };

          if (node?.isHeadline) {
            this.deleteHeadline.emit({
              data: node,
              apply,
            });
          } else {
            this.deleteFolder.emit({
              data: node,
              apply,
            });
          }
        }
      })
    ).subscribe();
  }

  private expandNode(flatNode: FolderItemFlatNode): void {
    if (!this.treeControl.isExpanded(flatNode)) {
      this.treeControl.expand(flatNode);
    }
  }

  private createContextMenuOverlay(e: any, context: TemplateRef<any>): void {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(e)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'folder-context-menu-backdrop',
    });

    this.overlayRef
      .backdropClick()
      .pipe(
        tap(() => this.closeContextMenu()),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.overlayRef.attach(new TemplatePortal(context, this.viewContainerRef));
  }

  private closeContextMenu(unfocus = true): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      if (unfocus) {
        this.focusedNode = null;
      }
    }
  }

  private setDefaultFolder(folder: FolderItem): void {
    this.selectedItem = folder;
    this.selectedFolder.emit(this.selectedItem);
  }

  private createEmptyFolder(inHeadline = false): void {
    if (!this.isCreating) {
      this.folderDatabase.createFolder(
        this.flatNodeMap.get(this.focusedNode) ?? this.selectedItem,
        this.nextPosition,
        inHeadline
      );
      this.ngZone.onStable.asObservable().pipe(first()).subscribe({
        next: () => {
          this.folderCreating.nativeElement.focus();
        },
      })
    }
  }

  private createEmptyHeadline(): void {
    if (!this.isCreating) {
      this.folderDatabase.createHeadline(this.nextPosition);
      this.ngZone.onStable.asObservable().pipe(first()).subscribe({
        next: () => {
          this.headlineCreating.nativeElement.focus();
        },
      })
    }
  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['commerceos-folders-app']).pipe(
      catchError((err) => {
        console.warn('Cant load translations for domains', ['commerceos-folders-app'], err);

        return of(true);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private checkClientWidth(): void {
    this.isMobileWidth = window.innerWidth <= 720 || this.embedMode;
  }

  private expandChildNode(folder: FolderItem): void {
    let node: FolderItem = this.getFlatNodeById(folder._id);
    let parent = null;
    let level = 0;

    if (node) {
      do {
        parent = this.folderDatabase.getParentFromNodes(node);
        node = this.getFlatNodeById(parent?._id);
        const nestedNode = this.nestedNodeMap.get(node);
        level = nestedNode?.level ?? 0;
        this.treeControl.expand(nestedNode);
      } while (node?.parentFolderId && level > 0);
    }
  }
}


