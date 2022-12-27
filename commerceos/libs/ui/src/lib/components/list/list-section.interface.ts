import { PeListSectionCategoriesEnum } from './list-section-categories.enum';
import { PeListSectionIntegrationInterface } from './list-section-integration.interface';
import { PeListSectionTypesEnum } from './list-section-types.enum';

export interface PeListSectionInterface {
  category: PeListSectionCategoriesEnum;
  integrations: PeListSectionIntegrationInterface[];
  isInForm: boolean;
  listType: PeListSectionTypesEnum;
  showAddButton: boolean;
  showGroupTitle: boolean;
  upperCase: boolean;
}
