import { PebIntegrationDataType } from '../models/api';
import { isIntegrationData, isIntegrationSelectLink, PebFunctionLink, PebFunctionType } from '../models/element';

import { PebMigration } from './migrations.interface';

export const linkToToFunctionLink: PebMigration = (page, element) => {
  if (element.data?.linkTo) {
    const functionLink = element.data?.linkTo;
    const { integration = null, link, action, interaction, ...context } = functionLink || {};
    const data = {
      ...link,
      dataType: link?.linkType,
      contextIntegration: link?.contextIntegration || link?.contextEntity,
    };

    const fn = {
      ...data,
      ...action,
      ...interaction,
      ...context,
      integration,
    };
    const functionType = getFunctionType(functionLink);

    if (![PebFunctionType.Data, PebFunctionType.SelectLink].includes(functionType)) {
      delete fn.dataType;
    }
    delete fn.linkType;
    delete fn.link;

    element.data = {
      ...element.data,
      functionLink: { ...fn, functionType },
    };

    delete (element?.data as any)?.linkTo;

    return element;
  }

  return element;
};

export function getFunctionType(functionLink: PebFunctionLink): PebFunctionType {
  return ('tags' in functionLink || (functionLink as any).action)
    ? PebFunctionType.Action
    : ((functionLink as any).link && (functionLink as any).link.linkType !== PebIntegrationDataType.Select)
      ? PebFunctionType.Data
      : ((functionLink as any).link && (functionLink as any).link.linkType === PebIntegrationDataType.Select)
        ? PebFunctionType.SelectLink
        : (isIntegrationData(functionLink) && (functionLink as any).dataType !== PebIntegrationDataType.Select)
            ? PebFunctionType.Data
            : isIntegrationSelectLink(functionLink) || (functionLink as any).dataType === PebIntegrationDataType.Select
              ? PebFunctionType.SelectLink
              : PebFunctionType.Interaction;
}
