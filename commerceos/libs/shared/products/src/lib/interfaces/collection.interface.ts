import { FormattedFilter } from './filter.interface';

export const mimeTypes = 'png|jpg|jpeg|bmp';

export interface Collection {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  channelSets: string[];
  parent?: string;
  activeSince: Date;
  activeTill?: Date;
  children?: any[];
  automaticFillConditions?: {
    strict: boolean;
    filters: FormattedFilter[];
  };
  productCount?: number;
}
