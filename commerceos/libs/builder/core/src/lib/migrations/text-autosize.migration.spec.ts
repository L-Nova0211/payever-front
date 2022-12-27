import { PebScreen } from '../constants';
import { PebElementType } from '../models/element';

import { textAutosize } from './text-autosize.migration';

describe('Migrations:text-autosize', () => {

  it('should set text autosize', () => {

    const elementDef = {
      id: 'elem',
      type: PebElementType.Text,
      data: null,
    };
    const page = {
      id: 'p-001',
      stylesheets: {
        [PebScreen.Desktop]: {
          [elementDef.id]: { display: 'none' },
        },
        [PebScreen.Tablet]: {
          [elementDef.id]: { display: 'none' },
        },
        [PebScreen.Mobile]: {
          [elementDef.id]: {
            display: 'none',
            minHeight: 350,
          },
        },
      },
    };

    /**
     * elementDef.data is null
     */
    expect(textAutosize(page as any, elementDef)).toEqual(elementDef);
    expect(elementDef.data).toBeNull();

    /**
     * elementDef.data.textAutosize is null
     */
    elementDef.data = { textAutosize: null };
    page.stylesheets[PebScreen.Mobile][elementDef.id].display = 'block';

    expect(textAutosize(page as any, elementDef)).toEqual(elementDef);
    expect(elementDef.data).toEqual({
      textAutosize: {
        height: true,
        width: true,
      },
    });

  });

});
