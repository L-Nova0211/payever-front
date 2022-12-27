import { PebScreen, PebTextJustify } from '../constants';
import { PebIntegrationActionTag } from '../models/api';
import { PebLanguage } from '../models/client';
import { PebElementType, PebFunctionType } from '../models/element';

import { gridAlignText } from './grid-align.migration';

describe('Migrations:grid-align', () => {

  it('should align grid text', () => {

    const element = {
      id: 'elem',
      type: PebElementType.Grid,
      data: null,
    };

    /**
     * element.data is null
     */
    expect(gridAlignText(null, element)).toEqual(element);
    expect(element.data).toBeNull();

    /**
     * element.data.functionLink is set
     * element.data.text is null
     */
    element.data = {
      functionLink: {
        functionType: PebFunctionType.Action,
        tags: [PebIntegrationActionTag.GetCategoriesByProducts],
      },
      text: null,
    };

    expect(gridAlignText(null, element)).toEqual(element);
    expect(element.data.text).toBeNull();

    /**
     * element.data.text is set
     */
    element.data.text = {
      [PebScreen.Desktop]: {
        [PebLanguage.English]: {
          ops: [
            { attributes: null },
            {
              attributes: {
                color: '#333333',
                textJustify: PebTextJustify.Center,
              },
            },
          ],
        },
      },
    };

    expect(gridAlignText(null, element)).toEqual(element);
    expect(element.data.text).toEqual({
      [PebScreen.Desktop]: {
        [PebLanguage.English]: {
          ops: [
            { attributes: null },
            {
              attributes: {
                color: '#333333',
                align: PebTextJustify.Center,
              },
            },
          ],
        },
      },
    });

  });

});
