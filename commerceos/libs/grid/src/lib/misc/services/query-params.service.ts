import { Injectable } from '@angular/core';
import { pick, omit } from 'lodash-es';
import { BehaviorSubject, Subject } from 'rxjs';

import { GridQueryParams } from '../enums';

const GRID_DATA = 'pe_grid_data';

@Injectable({
  providedIn: 'root',
})
export class PeGridQueryParamsService {
  restoreState$ = new Subject();
  private useQueryParams$ = new BehaviorSubject<boolean>(false);
  private canDestroyStorage$ = new BehaviorSubject<boolean>(true);
  private queryParams = {};

  set allowUseQueryParams(allow: boolean) {
    this.useQueryParams$.next(allow);
  }

  get allowUseQueryParams(): boolean {
    return this.useQueryParams$.value;
  }

  set canDestroyStorage(allow: boolean) {
    this.canDestroyStorage$.next(allow);
  }

  get canDestroyStorage(): boolean {
    return this.canDestroyStorage$.value;
  }

  constructor() {
    this.queryParams = JSON.parse(localStorage.getItem(GRID_DATA));
  }

  init(): void {
    if (this.allowUseQueryParams) {
      this.restoreState$.next(this.getQueryParams());
    }
  }

  scrollPositionToParams(positionTop: number): void {
    this.setQueryParam(GridQueryParams.ScrollTop, positionTop);
  }

  viewToParams(view: string): void {
    setTimeout(() => {
      this.setQueryParam(GridQueryParams.View, view);
    });
  }

  previewToParams(openPreview: string): void {
    this.setQueryParam(GridQueryParams.OpenPreview, openPreview);
  }

  pageToParams(page: number): void {
    this.setQueryParam(GridQueryParams.Page, page);
  }

  folderToParams(folder: string): void {
    this.setQueryParam(GridQueryParams.SelectedFolder, folder);
  }

  getQueryParams(): {[key: string]: number | string} {
    return pick(this.queryParams, Object.values(GridQueryParams));
  }

  getQueryParamByName(name: GridQueryParams): number | string {
    return pick(this.queryParams, [name])[name];
  }

  deleteQueryParamByName(name: GridQueryParams): void {
    setTimeout(() => {
      const queryParams = omit(this.queryParams, [name]);
      this.queryParams = queryParams;
      localStorage.setItem(GRID_DATA, JSON.stringify(queryParams));
    });
  }

  clearGridQueryParams(): void {
    localStorage.setItem(GRID_DATA, JSON.stringify([]));
  }

  destroy(): void {
    if (this.canDestroyStorage) {
      this.clearGridQueryParams();
      this.allowUseQueryParams = false;
      this.queryParams = null;
    }
  }

  private setQueryParam(param: GridQueryParams, value: number | string): void {
    if (this.allowUseQueryParams) {
      const queryParams = {
        ...this.queryParams,
        [param]: value,
      };
      this.queryParams = queryParams;
      localStorage.setItem(GRID_DATA, JSON.stringify(queryParams));
    }
  }
}
