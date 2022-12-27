import { Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  EnvService, PeDataGridFilterType, PeDataGridSortByAction, PeSearchItem,
} from '@pe/common';
import { FilterInterface, PeFilterChange } from '@pe/grid';

import { SearchFiltersInterface, SearchTransactionsInterface } from '../shared';

import { TransactionsClass } from './transactions.class';

export interface PeSearchItemEx extends PeSearchItem {
  label: string;
  filterID: string;
}

export class FilterTransactionsClass extends TransactionsClass {

  filterItems$ = new BehaviorSubject<FilterInterface[]>([]);
  filters: PeDataGridFilterType[] = [];
  sortByActions: PeDataGridSortByAction[] = null;

  private filterConfigurationData: SearchFiltersInterface = null;
  private searchItemsData2: PeFilterChange[] = null;
  protected envService = this.injector.get(EnvService);

  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

  get businessId(): string {
    return this.envService.businessId;
  }

  set searchItems2(items: PeFilterChange[]) {
    this.searchItemsData2 = items;
    try {
      sessionStorage?.setItem(`pe.transactions.${this.businessId}.filters2`, JSON.stringify(items));
    } catch (e) {}
  }

  get searchItems2(): PeFilterChange[] {
    if (!this.searchItemsData2) {
      try {
        this.searchItemsData2 = JSON.parse(sessionStorage?.getItem(`pe.transactions.${this.businessId}.filters2`)) || [];
      } catch (e) {
        this.searchItemsData2 = [];
      }
    }

    return this.searchItemsData2;
  }

  set filterConfiguration(items: SearchFiltersInterface) {
    this.filterConfigurationData = items;
    try {
      sessionStorage?.setItem(`pe.transactions.${this.businessId}.config`, JSON.stringify(items));
    } catch (e) {}
  }

  get filterConfiguration(): SearchFiltersInterface {
    if (!this.filterConfigurationData) {
      try {
        this.filterConfigurationData = JSON.parse(sessionStorage?.getItem(`pe.transactions.${this.businessId}.config`)) || [];
      } catch (e) {
        this.filterConfigurationData = null;
      }
    }

    return this.filterConfigurationData;
  }

  onFiltersChange(filterItems: PeFilterChange[]): void {
    this.searchItems2 = filterItems;
    this.filterConfiguration = {};
    this.searchItems2.forEach(a => {
      this.filterConfiguration[a.filter] = [];
    });

    this.searchItems2.forEach(a => {
      let existing = this.filterConfiguration[a.filter].find(b => b.condition === a.contain);
      if (!existing) {
        existing = {
          condition: a.contain,
          value: [a.search],
        };
        this.filterConfiguration[a.filter].push(existing);
      } else {
        existing.value.push(a.search);
      }
    });
    this.paginator.page = 0;
    this.listService.resetItems();
  }

  getSearchData(): SearchTransactionsInterface {
    const { page, perPage } = this.paginator;

    return {
      page: page + 1,
      perPage,
      ...this.sortData,
      configuration: this.filterConfiguration,
    };
  }

  onSortAction(orderBy: string, direction: string): void {
    this.sortData = {
      orderBy: orderBy === 'customer_name' ? 'customer_name.keyword' : orderBy,
      direction,
    }
    this.listService.resetItems();
  }
}

