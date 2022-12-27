import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { FolderItem } from '@pe/folders';

import { PeMessageFolder } from '../interfaces';

@Injectable()
export class PeMessageNavService {
  private readonly activeFolder$ = new BehaviorSubject<PeMessageFolder | null>(null);
  public readonly defaultFolderIcon = `${this.env.custom.cdn}/icons-png/dashboard-filter-copy.png`;
  public readonly folderTree$ = new BehaviorSubject<FolderItem[]>([]);
  public selectedFolderId: string;

  constructor(@Inject(PE_ENV) private env: EnvironmentConfigInterface) { }

  public sidenavName$ = new BehaviorSubject<string>(null);
  public set sidenavName(sidenavName: string) {
    this.sidenavName$.next(sidenavName);
  }

  public get activeFolder(): PeMessageFolder | null {
    return this.activeFolder$.value;
  }

  public set activeFolder(folder: PeMessageFolder | null) {
    this.activeFolder$.next(folder);
  }

  public get folderTree(): FolderItem[] {
    return this.folderTree$.value;
  }

  public set setFolderTree(folderTree: FolderItem[]) {
    this.folderTree$.next(folderTree);
  }

  public destroy(): void {
    this.activeFolder$.next(null);
    this.folderTree$.next([]);
  }
}
