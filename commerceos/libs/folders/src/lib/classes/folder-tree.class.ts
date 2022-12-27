import { FlatTreeControl } from '@angular/cdk/tree';
import { Injector } from '@angular/core';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { differenceWith, isEqual } from 'lodash-es';
import { merge, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PeFoldersContextMenuEnum } from '../enums/folders.enum';
import { FolderItem, FolderPosition } from '../interfaces/folder.interface';
import { FolderDatabase } from '../services/folder-database.service';
import { FolderService } from '../services/folder.service';

import { FolderItemFlatNode } from './folder-item.class';

export class FolderTree {
  flatNodeMap = new Map<FolderItemFlatNode, FolderItem>();
  nestedNodeMap = new Map<FolderItem, FolderItemFlatNode>();

  treeControl: FlatTreeControl<FolderItemFlatNode>;
  treeFlattener: MatTreeFlattener<FolderItem, FolderItemFlatNode>;
  dataSource: MatTreeFlatDataSource<FolderItem, FolderItemFlatNode>;
  positionChanged$ = new Subject<FolderPosition[]>();
  emptyFolderId: string;
  applyFolderId: string;
  folderToUpdate: FolderItem;

  protected folderDatabase = this.injector.get(FolderDatabase);
  protected folderService = this.injector.get(FolderService);

  private currentPositions: FolderPosition[] = [];
  private maxPosition = 0;
  private defaultContextMenuItems = [
    PeFoldersContextMenuEnum.Edit,
    PeFoldersContextMenuEnum.Copy,
    PeFoldersContextMenuEnum.Paste,
    PeFoldersContextMenuEnum.Duplicate,
    PeFoldersContextMenuEnum.AddFolder,
    PeFoldersContextMenuEnum.AddHeadline,
    PeFoldersContextMenuEnum.Delete,
  ];

  hasChildren = (_: number, flatNode: FolderItemFlatNode) =>
    flatNode.children?.length;

  isCreateFolder = (_: number, flatNode: FolderItemFlatNode) =>
    flatNode.name === '' && !flatNode.isHeadline;

  isCreateHeadline = (_: number, flatNode: FolderItemFlatNode) =>
    flatNode.name === '' && flatNode.isHeadline;

  private isExpandable = (flatNode: FolderItemFlatNode) => flatNode.expandable;
  private getChildren = (node: FolderItem): FolderItem[] => node.children;
  private getLevel = (flatNode: FolderItemFlatNode) => flatNode?.level;

  get nextPosition() {
    return this.maxPosition ? this.maxPosition : 0;
  }

  constructor(
    protected injector: Injector,
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<FolderItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    merge(
      this.folderDatabase.dataChange$.pipe(
        tap(payload => {
          if (payload?.reset) {
            this.flatNodeMap.clear();
            this.nestedNodeMap.clear();
            this.dataSource.data = [];
          }

          if (payload?.updateFolder) {
            this.folderToUpdate = payload?.updateFolder;
          }
          this.dataSource.data = payload.data;
        })
      ),
      this.folderDatabase.changeEmptyId$.pipe(
        tap(val => {
          this.applyFolderId = val;
        })
      ),
      this.dataSource._flattenedData
        .pipe(
          tap(folders => {
            this.calculatePositions(folders);
          })
        )
    ).pipe()
      .subscribe();
  }

  applyNode(node: FolderItemFlatNode, name: string, cb: (node?: FolderItem) => void): void {
    const nestedNode = this.flatNodeMap.get(node);

    if (name) {
      cb(nestedNode);

      node.name = name;
      if (node.editing) {
        node.editing = false;
      }
    } else {
      this.folderDatabase.deleteItem(nestedNode);
    }
  }

  checkName(name: string): string {
    let suffix = 1;
    let itemIndex = [...this.flatNodeMap.values()].findIndex((el: any) => el.name == name);
    let tmpName = `${name} ${suffix}`;

    while (itemIndex >= 0 && suffix <= 100) {
      tmpName = `${name} ${suffix}`;
      itemIndex = [...this.flatNodeMap.values()].findIndex((el: any) => el.name == tmpName);
      suffix += 1;
    }

    return tmpName;
  }

  getFlatNodeById(folderId: string): FolderItem {
    return this.deepFlatten(this.dataSource.data).find(item => item._id === folderId)
  }

  private deepFlatten(dataSource: FolderItem[]): FolderItem[] {
    return dataSource.reduce((acc, item) => {
      if (item.children) {
        acc = [...acc, ...this.deepFlatten(item.children)]
      }

      return [...acc, item]
    }, [])
  }

  private calculatePositions(folders: FolderItemFlatNode[]):void {
    const initPositions = !this.currentPositions.length;
    const positions: FolderPosition[] = [];
    let i = 0;

    folders.forEach((folder: FolderItemFlatNode, position) => {
      const flatNode = this.flatNodeMap.get(folder);
      const positionData: FolderPosition = {
        _id: folder._id,
        position: position,
        parentFolderId: folder.parentFolderId,
      };

      this.maxPosition = i;
      this.folderService.nextPosition = this.maxPosition;
      this.flatNodeMap.set(folder, { ...flatNode, position: position });
      positions.push(positionData);

      if (initPositions) {
        this.currentPositions.push(positionData);
      }
      if (!folder.name) {
        this.emptyFolderId = folder._id;
      }
      i += 1;
    });

    this.differenceNodes(positions);
    this.updateAfterSetPosition(positions);
  }

  private updateAfterSetPosition(positions: FolderPosition[]): void {
    if (this.folderToUpdate?.parentFolderId !== this.folderToUpdate?.data.oldParent
      && this.folderToUpdate?._id
      && this.folderToUpdate?.name
    ) {
      const position = positions.find(item => item._id === this.folderToUpdate._id);
      this.folderDatabase.nodeChange$.next({
        ...this.folderToUpdate,
        position: position.position,
      })

      this.folderToUpdate = null;
    }
  }

  private differenceNodes(positions: FolderPosition[]): void {
    const difference: FolderPosition[] = differenceWith(positions, this.currentPositions, isEqual)?.filter(
      (folder: FolderPosition) => folder._id !== this.applyFolderId && folder._id !== this.emptyFolderId
    );

    this.applyFolderId = null;
    this.emptyFolderId = null;

    if (difference.length) {
      this.positionChanged$.next(difference);
      this.currentPositions = [...positions];
    }
  }

  private transformer = (node: FolderItem, level: number): FolderItemFlatNode => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode._id === node._id
      ? existingNode
      : new FolderItemFlatNode();
    const position = Number(node.position);
    flatNode._id = node._id;
    flatNode.name = node.name;
    flatNode.image = node.image;
    flatNode.imageIcon = node.imageIcon;
    flatNode.isAvatar = node.isAvatar || false;
    flatNode.abbrText = node.abbrText || null;
    flatNode.description = node.description;
    flatNode.isHeadline = node.isHeadline || false;
    flatNode.children = node.children;
    flatNode.editing = node.editing;
    flatNode.level = level;
    flatNode.parentFolderId = node.parentFolderId;
    flatNode.parentIsHeadline = !!node?.data?.parentIsHeadline;
    flatNode.expandable = !!node?.children?.length;
    flatNode.isProtected = node?.isProtected;
    flatNode.isHideMenu = node?.isHideMenu;
    flatNode.isExpanded = node?.isExpanded;
    flatNode.menuItems = node?.menuItems ?? this.defaultContextMenuItems;
    flatNode.position = Number.isNaN(position) ? 0 : position;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);

    return flatNode;
  }
}
