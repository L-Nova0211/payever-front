import { PebFunctionLink, PebIntegrationForm, PebThemePageInterface } from '@pe/builder-core';
import { PebEditorElement } from '@pe/builder-main-renderer';


export interface GridIntegrationActionParams {
  elements: PebEditorElement[];
  value: PebIntegrationForm;
  functionLink: PebFunctionLink;
  filters?: any;
  productsIds?: string[];
  categoriesIds?: string[];
  page?: PebThemePageInterface;
  detailAction?: boolean;
}

export interface GridContext {
  service: 'integrations' | string;
  method: 'fetchActionWithAdditional' | 'fetchDetailActionWithAdditional';
  params: any[];
}
