import { PebScreen } from '../constants';
import { PebLanguage } from '../models/client';
import { PebElementType } from '../models/element';

import { collectFonts } from './collect-fonts.migration';

describe('Migrations:collect-fonts', () => {

  it('should collect fonts', () => {

    const elementDef = {
      id: 'elem',
      type: PebElementType.Shape,
      data: null,
    };
    const page = {
      id: 'p-001',
      data: null,
    };
    const text = {
      [PebScreen.Desktop]: {
        [PebLanguage.Generic]: {
          ops: [
            { attributes: null },
            {
              attributes: {
                fontFamily: 'Montserrat',
                fontWeight: 400,
                italic: false,
              },
            },
            {
              attributes: {
                fontFamily: 'Montserrat',
                fontWeight: 400,
                italic: true,
              },
            },
            {
              attributes: {
                fontFamily: 'Montserrat',
                fontWeight: 400,
                italic: true,
              },
            },
          ],
        },
        [PebLanguage.English]: {
          ops: [
            {
              attributes: {
                fontFamily: 'Raleway',
                fontWeight: 600,
                italic: true,
              },
            },
            {
              attributes: {
                fontFamily: 'Test',
                fontWeight: 600,
                italic: true,
              },
            },
          ],
        },
      },
      [PebScreen.Mobile]: {
        [PebLanguage.English]: {
          ops: [{
            attributes: {
              fontFamily: 'Raleway',
              fontWeight: 400,
              italic: false,
            },
          }],
        },
      },
    };

    /**
     * elementDef.data & page.data are null
     */
    collectFonts(page as any, elementDef);

    /**
     * elementDef.data.text is set
     */
    elementDef.data = { text };
    collectFonts(page as any, elementDef);

    expect(page.data.fonts).toEqual({
      [PebScreen.Desktop]: {
        [PebLanguage.Generic]: [
          {
            name: 'Roboto',
            weights: ['400'],
          },
          {
            name: 'Montserrat',
            weights: ['400', '400i'],
          },
        ],
        [PebLanguage.English]: [{
          name: 'Raleway',
          weights: ['600i'],
        }],
      },
      [PebScreen.Mobile]: {
        [PebLanguage.English]: [{
          name: 'Raleway',
          weights: ['400'],
        }],
      },
    });

    /**
     * page.data.fonts is set
     */
    text[PebScreen.Desktop][PebLanguage.English].ops.push(
      {
        attributes: {
          fontFamily: 'Raleway',
          fontWeight: 600,
          italic: false,
        },
      },
      {
        attributes: {
          fontFamily: 'Poppins',
          fontWeight: 900,
          italic: false,
        },
      },
    );
    collectFonts(page as any, elementDef);

    expect(page.data.fonts[PebScreen.Desktop][PebLanguage.English]).toEqual([
      {
        name: 'Raleway',
        weights: ['600i', '600'],
      },
      {
        name: 'Poppins',
        weights: ['900'],
      },
    ]);

    /**
     * elementDef.data is null
     */
    elementDef.data = null;
    collectFonts(page as any, elementDef);

    expect(page.data.fonts).toEqual({
      [PebScreen.Desktop]: {
        [PebLanguage.Generic]: [
          {
            name: 'Roboto',
            weights: ['400'],
          },
          {
            name: 'Montserrat',
            weights: ['400', '400i'],
          },
        ],
        [PebLanguage.English]: [
          {
            name: 'Raleway',
            weights: ['600i', '600'],
          },
          {
            name: 'Poppins',
            weights: ['900'],
          },
        ],
      },
      [PebScreen.Mobile]: {
        [PebLanguage.English]: [{
          name: 'Raleway',
          weights: ['400'],
        }],
      },
    });

  });

});
