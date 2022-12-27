import { PeBuilderHeaderMenuActionsEnum } from '../enums';

import { PeBuilderHeaderMenuOptionInterface } from './builder-header-menu-option.interface';

export interface PeBuilderHeaderMenuDataInterface {
  action: PeBuilderHeaderMenuActionsEnum;
  options: PeBuilderHeaderMenuOptionInterface[];
  title: string;
}
