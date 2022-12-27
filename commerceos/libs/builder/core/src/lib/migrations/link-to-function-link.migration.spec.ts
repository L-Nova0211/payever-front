import { PebIntegrationActionTag, PebIntegrationDataType } from '../models/api';
import { PebElementType, PebFunctionType } from '../models/element';
import { PebInteractionType } from '../utils';

import { getFunctionType, linkToToFunctionLink } from './link-to-function-link.migration';

describe('Migrations:link-to-function-link', () => {

  it('should convert link to function link', () => {

    const element = {
      id: 'elem',
      type: PebElementType.Shape,
      data: null,
    };
    const linkTo = {
      link: null,
      action: {
        tags: [PebIntegrationActionTag.GetCategoriesByProducts],
      },
      interaction: { type: PebInteractionType.CartClick },
      test: 'context',
    };
    const link = {
      linkType: PebIntegrationDataType.Text,
      contextEntity: 'test.context.entity',
    };

    /**
     * element.data is null
     */
    expect(linkToToFunctionLink(null, element)).toEqual(element);
    expect(element.data).toBeNull();

    /**
     * element.data.linkTo is set
     * element.data.linkTo.link & integration are null
     */
    element.data = { linkTo };

    expect(linkToToFunctionLink(null, element)).toEqual(element);
    expect(element.data.functionLink).toEqual({
      contextIntegration: undefined,
      type: linkTo.interaction.type,
      tags: linkTo.action.tags,
      test: 'context',
      integration: null,
      functionType: PebFunctionType.Action,
    });

    /**
     * element.data.linkTo.link & integration are set
     * element.data.linkTo.action is null
     */
    linkTo.link = link;
    linkTo.action = null;
    linkTo[`integration`] = { id: 'i-001' };
    element.data = { linkTo };

    expect(linkToToFunctionLink(null, element)).toEqual(element);
    expect(element.data.functionLink).toEqual({
      contextEntity: link.contextEntity,
      dataType: link.linkType,
      contextIntegration: link.contextEntity,
      type: PebInteractionType.CartClick,
      test: 'context',
      integration: linkTo[`integration`],
      functionType: PebFunctionType.Data,
    });

  });

  it('should get function type', () => {

    const functionLink = {
      functionType: PebFunctionType.Data,
      dataType: PebIntegrationDataType.Select,
      action: {
        tags: [PebIntegrationActionTag.GetCategoriesByProducts],
      },
      link: {
        linkType: PebIntegrationDataType.Text,
      },
    };

    /**
     * functionLink.action is set
     */
    expect(getFunctionType(functionLink as any)).toEqual(PebFunctionType.Action);

    /**
     * functionLink.action is null
     * functionLink.link.linkType is PebIntegrationDataType.Text
     */
    functionLink.action = null;
    expect(getFunctionType(functionLink as any)).toEqual(PebFunctionType.Data);

    /**
     * functionLink.link.linkType is PebIntegrationDataType.Select
     */
    functionLink.link.linkType = PebIntegrationDataType.Select;
    expect(getFunctionType(functionLink as any)).toEqual(PebFunctionType.SelectLink);

    /**
     * functionLink.link is null
     * functionLink.functionType is PebFunctionType.Data
     * functionLink.dataType is PebIntegrationDataType.Input
     */
    functionLink.link = null;
    functionLink.dataType = PebIntegrationDataType.Input;
    expect(getFunctionType(functionLink as any)).toEqual(PebFunctionType.Data);

    /**
     * functionLink.dataType is PebIntegrationDataType.Select
     */
    functionLink.dataType = PebIntegrationDataType.Select;
    expect(getFunctionType(functionLink as any)).toEqual(PebFunctionType.SelectLink);

    /**
     * functionLink.functionType is PebFunctionType.ActionData
     * functionLink.dataType is PebIntegrationDataType.Languages
     */
    functionLink.functionType = PebFunctionType.ActionData;
    functionLink.dataType = PebIntegrationDataType.Languages;
    expect(getFunctionType(functionLink as any)).toEqual(PebFunctionType.Interaction);

  });

});
