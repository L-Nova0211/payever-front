import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable, TemplateRef } from '@angular/core';

import { TranslateService } from '@pe/i18n-core';

import { PeGridMenuService } from '../menu/menu.service';
import {
  PeGridMenu,
  PeFilterChange,
  PeFilterConditions,
  PeFilterKeyInterface,
  PeFilterType,
  PeTwoFieldsConditions,
} from '../misc/interfaces';

@Injectable({ providedIn: 'any' })
export class PeGridToolbarService {
  filterFormRef: TemplateRef<any>;
  searchOverlay: OverlayRef;
  totalItems: number;

  constructor(
    private peGridMenuService: PeGridMenuService,
    private translateService: TranslateService,
  ) {
  }

  openMobileSearch(): void {
    this.searchOverlay = this.peGridMenuService.openSearch({
      title: 'search',
      items: [],
      templateRef: this.filterFormRef,
    });
  }

  getFilterKeys(filterConfig: PeFilterKeyInterface[]): PeGridMenu {
    return {
      items: filterConfig.map(a => {
        return {
          label: this.translateService.hasTranslation(a.label) ? this.translateService.translate(a.label) : a.label,
          value: a.fieldName,
          containsTranslations: !!a.containsTranslations,
        };
      }),
    };
  }

  getConditions(key: string, filterConfig: PeFilterKeyInterface[]): PeGridMenu {
    const filterConditions = filterConfig.find(a => a.fieldName === key)?.filterConditions;

    return {
      items: filterConditions?.map(b => {
        return {
          label: this.translateService.translate(`grid.values.filter_conditions.${b}`),
          value: b,
        };
      }) || [],
    };
  }

  getValueOptions(key: string, filterConfig: PeFilterKeyInterface[]): PeGridMenu {
    const valueOptions = filterConfig.find(a => a.fieldName === key)?.options;

    return {
      items: valueOptions?.map(b => {
        return {
          label: this.translateService.hasTranslation(b.label) ? this.translateService.translate(b.label) : b.label,
          value: b.value,
        };
      }) || [],
    };
  }

  getValueType(key: string, filterConfig: PeFilterKeyInterface[]): PeFilterType {
    return filterConfig.find(a => a.fieldName === key)?.type || PeFilterType.String;
  }

  isValueBetween(condition: PeFilterConditions): boolean {
    return PeTwoFieldsConditions.indexOf(condition) >= 0;
  }

  getFilterKeyFormatted(searchItem: PeFilterChange, filterConfig: PeFilterKeyInterface[]): string {
    return this.getFilterKeys(filterConfig).items.find(a => a.value === searchItem.filter.split('.')[0])?.label;
  }

  getFilterConditionFormatted(searchItem: PeFilterChange, filterConfig: PeFilterKeyInterface[]): string {
    const items = this.getConditions(searchItem.filter.split('.')[0], filterConfig).items ?? [];

    return (items.find(a => a.value === searchItem.contain) ?? items[0])?.label;
  }

  getFilterValueFormatted(searchItem: PeFilterChange, filterConfig: PeFilterKeyInterface[]): string {
    const key = searchItem.filter;
    const type = this.getValueType(key, filterConfig);
    const value = searchItem.search as any;
    const isBetween = value?.from && value?.to;
    if (type === PeFilterType.String || type === PeFilterType.Number) {
      return isBetween ? `${String(value.from)} - ${String(value.to)}` : String(value);
    }
    if (type === PeFilterType.Option) {
      if (isBetween) {
        const from = this.getValueOptions(key, filterConfig)?.items.find(a => a.value === value.from)?.label || 'Unknown';
        const to = this.getValueOptions(key, filterConfig)?.items.find(a => a.value === value.to)?.label || 'Unknown';

        return `${from} - ${to}`;
      } else {
        return this.getValueOptions(key, filterConfig)?.items.find(a => a.value === value)?.label || 'Unknown';
      }
    }
    if (type === PeFilterType.Date) {
      return isBetween ? `${this.formatDate(value.from)} - ${this.formatDate(value.to)}` : this.formatDate(value);
    }
    if (type === PeFilterType.Time) {
      return value;
    }

    return 'Invalid value';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [day, month, year].join('.');
  }
}
