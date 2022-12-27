import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { v4 } from 'uuid';

import { DragAreaTypes, FolderItem } from '../interfaces/folder.interface';

@Injectable()
export class FolderDatabase {
  dataChange$ = new BehaviorSubject<{
    data: FolderItem[],
    reset?: boolean,
    updateFolder?: FolderItem,
  }>({ data: [] });

  nodeChange$ = new ReplaySubject<FolderItem>(1);
  deleteNode$ = new ReplaySubject<FolderItem>(1);
  isStateRestore = true;
  changeEmptyId$ = new Subject<string>();

  private resetStateData: FolderItem[];

  get data(): FolderItem[] { return this.dataChange$.value.data; }

  initialize(treeData) {
    treeData = cloneDeep(treeData);
    const data = this.buildFileTree(treeData);

    this.dataChange$.next({ data });
  }

  createHeadline(position: number) {
    this.createNode(null, {
      isHeadline: true,
      position,
      level: 0,
      data: {
        parentIsHeadline: true,
      },
    });
  }

  addFolder(parent, newNode: FolderItem) {
    this.insertItem(parent, newNode, DragAreaTypes.Center, true);
  }

  createFolder(selectedNode: FolderItem, position: number, inHeadline = false) {
    const parent = !inHeadline ? this.getParentFromNodes(selectedNode) : selectedNode;
    const emptyNode = {
      isHeadline: false,
      position,
      data: {
        parentIsHeadline: !!selectedNode?.data?.parentIsHeadline,
      },
    };
    this.createNode(parent, emptyNode)
  }

  duplicate(node: FolderItem, newItem: FolderItem,) {
    let parent: FolderItem = this.getParentFromNodes(node);

    newItem.children = [];

    if (parent !== null) {
      const newNode = this.prepareNewNode({ ...newItem, parentFolderId: parent._id }, this.parentIsHeadline(parent));
      parent.children.push(newNode);
    } else {
      this.data.push(this.prepareNewNode(newItem, this.parentIsHeadline(parent)));
    }

    this.dataChange$.next({ data: this.data });

    return this.prepareNewNode(newItem, this.parentIsHeadline(parent) || newItem?.isHeadline);
  }

  insertItemAbove(node: FolderItem, newItem: FolderItem, isForceCreate = false): FolderItem {
    this.setResetState();

    return this.insertItem(node, newItem, DragAreaTypes.Above, isForceCreate);
  }

  insertItemInto(node: FolderItem, newItem: FolderItem, isForceCreate = false): FolderItem {
    this.setResetState();

    return this.insertItem(node, newItem, DragAreaTypes.Center, isForceCreate);
  }

  insertItemBelow(node: FolderItem, newItem: FolderItem, isForceCreate = false): FolderItem {
    this.setResetState();

    return this.insertItem(node, newItem, DragAreaTypes.Below, isForceCreate);
  }

  updateAfterInsert(folder: FolderItem, oldId: string) {
    let index = this.data.findIndex(el => el._id === oldId);

    if (index > -1) {
      this.deleteNode$.next(this.data[index]);
      this.data[index] = { ...this.data[index], ...folder };

      this.dataChange$.next({ data: this.data });
    } else {
      this.data.forEach(node => {
        if (node?.children?.length) {
          this.updateChildNode(node.children, folder, oldId);
        }
      });
    }

    setTimeout(() => {
      this.isStateRestore = true;
      this.setResetState()
    });
  }

  updateItem(node: FolderItem, name?: string) {
    this.setResetState();
    const updateTree = (treeToUpdate: FolderItem[], nodeToUpdate: FolderItem): boolean => treeToUpdate
      .some((node) => {
        if (node._id === nodeToUpdate._id) { node.name = name; return true; }

        return updateTree(node.children, nodeToUpdate);
      });
    name && updateTree(this.data, node) && this.dataChange$.next({ data: this.data });
  }

  deleteItem(oldNode: FolderItem, resetData = true) {
    this.deleteNode(this.data, oldNode);
    if (resetData) {
      this.setResetState();
      this.dataChange$.next({ data: this.data });
    }
  }

  getParentFromNodes(node: FolderItem): FolderItem {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {

        return parent;
      }
    }

    return null;
  }

  getParent(currentRoot: FolderItem, node: FolderItem): FolderItem {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child._id === node?._id) {
          return currentRoot;
        } else if (child.children?.length) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }

    return null;
  }

  copyPasteItemAbove(from: FolderItem, to: FolderItem): FolderItem {
    this.setResetState();

    return this.copyPasteItem(from, to, DragAreaTypes.Above);
  }

  copyPasteItemInto(from: FolderItem, to: FolderItem): FolderItem {
    this.setResetState();

    return this.copyPasteItem(from, to, DragAreaTypes.Center);
  }

  copyPasteItemBelow(from: FolderItem, to: FolderItem): FolderItem {
    this.setResetState();

    return this.copyPasteItem(from, to, DragAreaTypes.Below);
  }

  resetState() {
    setTimeout(() => {
      this.dataChange$.next({ data: this.resetStateData });
      this.isStateRestore = true;
    })
  }

  generateId(): string {
    return v4();
  }

  private updateChildNode(nodes: FolderItem[], updateFolder: FolderItem, oldId: string) {
    let index = nodes.findIndex(el => el._id === oldId);

    if (index > -1) {
      this.deleteNode$.next(nodes[index]);
      nodes[index] = { ...nodes[index], ...updateFolder };
      this.dataChange$.next({ data: this.data });
    } else {
      nodes.forEach(node => {
        if (node?.children?.length) {
          this.updateChildNode(node.children, updateFolder, oldId);
        }
      });
    }
  }

  private deleteNode(nodes: FolderItem[], nodeToDelete: FolderItem) {
    const index = nodes.findIndex(node => node._id === nodeToDelete._id);
    if (index > -1) {
      this.deleteNode$.next(nodes[index]);
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node?.children?.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }

  setResetState() {
    if (this.isStateRestore) {
      this.resetStateData = cloneDeep(this.data);
      this.isStateRestore = false;
    }
  }

  private copyPasteItem(from: FolderItem, to: FolderItem, area: DragAreaTypes, isForceInsert = false): FolderItem {
    let newItem: FolderItem = this.insertItem(to, from, area, isForceInsert);

    if (from.children) {
      from.children.forEach(child => {
        this.deleteItem(child);
        this.copyPasteItem(child, newItem, DragAreaTypes.Center, true);
      });
    }

    return newItem;
  }

  private insertItem(node: FolderItem, newItem: FolderItem, area: DragAreaTypes, isForceInsert = false): FolderItem {
    let parent: FolderItem = null;
    const oldParent = newItem.parentFolderId;
    const findById = (item: FolderItem) => item._id === node._id;

    if (node) {
      if (area === DragAreaTypes.Above || area === DragAreaTypes.Below) {
        parent = this.getParentFromNodes(node);
      } else {
        parent = node;
      }
    }

    newItem.parentFolderId = parent?._id || null;

    if (isForceInsert) {
      newItem.children = [];
    }

    if (parent !== null) {
      const newNode = this.prepareNewNode(
        { ...newItem, parentFolderId: parent._id },
        this.parentIsHeadline(parent)
      );

      if (area === DragAreaTypes.Above) {
        parent.children.splice(parent.children.findIndex(findById), 0, newNode);
      } else if (area === DragAreaTypes.Below) {
        parent.children.splice(parent.children.findIndex(findById) + 1, 0, newNode);
      } else if (area === DragAreaTypes.Center) {
        parent.children.push(newNode);
      }
      if (newItem.children) {
        newItem.children = this.rebuildChildrenData(newItem?.children, this.parentIsHeadline(parent));
      }
    } else {
      const newNode = this.prepareNewNode(
        newItem,
        newItem?.isHeadline || newItem?.data?.parentIsHeadline || this.parentIsHeadline(parent)
      );

      if (area === DragAreaTypes.Above) {
        this.data.splice(this.data.findIndex(findById), 0, newNode);
      } else if (area === DragAreaTypes.Below) {
        this.data.splice(this.data.findIndex(findById) + 1, 0, newNode);
      } else if (area === DragAreaTypes.Center) {
        this.data.push(this.prepareNewNode(newItem, this.parentIsHeadline(parent)));
      }
    }

    if (!isForceInsert) {
      this.dataChange$.next({
        data: this.data,
        reset: false,
        updateFolder: {
          ...newItem, data: {
            ...newItem.data,
            oldParent,
          },
        },
      });
    } else {
      this.dataChange$.next({ data: this.data });
    }

    return this.prepareNewNode(newItem, this.parentIsHeadline(parent) || newItem?.isHeadline);
  }

  private createNode(parent: FolderItem, data: { position: number, [key: string]: any }) {
    const newId = this.generateId();
    let emptyNode = {
      _id: newId,
      name: '',
      ...data,
      children: [],
    };

    this.changeEmptyId$.next(newId);

    this.insertItem(parent, emptyNode, DragAreaTypes.Center, true);
  }

  private parentIsHeadline(node: FolderItem): boolean {
    return node?.isHeadline || node?.data?.parentIsHeadline;
  }

  private prepareNewNode(newItem: FolderItem, parentIsHeadline = false): FolderItem {
    return { ...newItem, data: { ...newItem?.data, parentIsHeadline } }
  }

  private buildFileTree(folders: FolderItem[]): FolderItem[] {
    return folders?.reduce<FolderItem[]>((accumulator, folder) => {
      if (!folder?.children?.length) {
        folder.children = [];
      } else {
        folder.children = this.rebuildChildrenData(folder.children, folder?.isHeadline)
      }

      if (folder?.isHeadline) {
        folder.data = { ...folder?.data, parentIsHeadline: true }
      }

      return accumulator.concat(folder);
    }, []);
  }

  private rebuildChildrenData(children: FolderItem[], parentIsHeadline = false): any {
    if (Array.isArray(children)) {
      children.map(child => {
        if (child.children) {
          this.rebuildChildrenData(child.children, parentIsHeadline);
        }

        return child.data = { ...child?.data, parentIsHeadline };
      })

      return children;
    }
  }
}
