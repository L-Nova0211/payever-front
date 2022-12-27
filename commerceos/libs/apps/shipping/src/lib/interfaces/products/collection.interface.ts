import { FormattedFilter } from './filter.interface';
import { PaginationInfoCamelCase } from './pagination.interface';

export const mimeTypes = 'png|jpg|jpeg|bmp';

export interface Collection {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  channelSets: string[];
  activeSince: Date;
  activeTill?: Date;
  automaticFillConditions?: {
    strict: boolean,
    filters: FormattedFilter[]
  };
}

export interface CollectionsLoadedInterface {
  info: PaginationInfoCamelCase;
  collections: Collection[];
}
