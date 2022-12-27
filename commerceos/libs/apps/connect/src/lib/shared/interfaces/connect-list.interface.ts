import { BehaviorSubject } from 'rxjs';

import { PeDataGridItem } from '@pe/common';

import { IntegrationInfoBadgeInterface, IntegrationInfoWithStatusInterface } from './integration.interface';

export interface PeDataGridItemWithCard extends PeDataGridItem {
  isLoading$?: BehaviorSubject<boolean>;
  title?: string;
  cardItem: IntegrationInfoWithStatusInterface;
  subscriptionId?: string;
  badge?: IntegrationInfoBadgeInterface;
}

export interface PeConnectFolderInterface {
  collection: any[],
  filters: Object,
  pagination_data: {
    page: number,
    total: number
  },
  usage: Object
}

export interface PeSort {
  order: string;
  field: string;
}

export interface ValuesInterface {
  filters?: ValuesInterfaceFilters[];
}

export interface ValuesInterfaceFilters {
  fieldName: string;
  filterConditions: string[];
  label: string;
  type: string;
}
