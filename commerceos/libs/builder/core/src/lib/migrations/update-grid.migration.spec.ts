import { PebScreen } from '../constants';
import { PebElementType } from '../models/element';

import { updateGrid } from './update-grid.migration';

describe('Migrations:update-grid', () => {

  it('should update grid', () => {

    const elementDef = {
      id: 'elem',
      type: PebElementType.Grid,
      parent: null,
      children: [],
    };
    const parent = {
      id: 'parent-001',
    };
    const page = {
      id: 'p-001',
      stylesheets: {
        [PebScreen.Desktop]: {
          [elementDef.id]: {
            display: 'grid',
            position: null,
            gridRow: '2',
            gridColumn: '2',
            gridArea: null,
            marginTop: null,
            marginLeft: null,
            top: null,
            left: null,
          },
          [parent.id]: {
            gridTemplateRows: null,
            gridTemplateColumns: null,
          },
          ['child-001']: {
            top: 100,
            height: 300,
          },
        },
        [PebScreen.Tablet]: {
          display: 'none',
        },
      },
    };

    /**
     * elementDef.parent is null
     * elementStyles.marginTop & marginLeft are null
     */
    expect(updateGrid(page as any, elementDef)).toEqual(elementDef);
    expect(page.stylesheets[PebScreen.Desktop][elementDef.id]).toEqual({
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      position: 'absolute',
      top: 0,
      left: 0,
    } as any);

    /**
     * elementStyles.marginTop & marginLeft are set
     */
    page.stylesheets[PebScreen.Desktop][elementDef.id] = {
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      marginTop: 20,
      marginLeft: 40,
    } as any;

    expect(updateGrid(page as any, elementDef)).toEqual(elementDef);
    expect(page.stylesheets[PebScreen.Desktop][elementDef.id]).toEqual({
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      top: 20,
      left: 40,
    } as any);

    /**
     * elementDef.type is PebElementType.Document
     */
    elementDef.type = PebElementType.Document;
    page.stylesheets[PebScreen.Desktop][elementDef.id] = {
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      position: null,
      top: null,
      left: null,
    };

    expect(updateGrid(page as any, elementDef)).toEqual(elementDef);
    expect(page.stylesheets[PebScreen.Desktop][elementDef.id]).toEqual({
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      position: null,
      top: null,
      left: null,
    } as any);

    /**
     * elementDef.type is PebElementType.Grid
     * elementDef.parent is set
     * parentStyles.gridTemplateColumns & gridTemplateRows are null
     */
    elementDef.type = PebElementType.Grid;
    elementDef.parent = parent;

    expect(updateGrid(page as any, elementDef)).toEqual(elementDef);
    expect(page.stylesheets[PebScreen.Desktop][elementDef.id]).toEqual({
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      position: 'absolute',
      top: 20,
      left: 40,
    } as any);

    /**
     * page.stylesheets[PebScreen.Desktop][parent.id].gridTemplateColumns & gridTemplateRows are set
     * elementStyles.gridArea, marginTop & marginLeft are null
     */
    page.stylesheets[PebScreen.Desktop][elementDef.id] = {
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      position: null,
      marginTop: null,
      marginLeft: null,
    };
    page.stylesheets[PebScreen.Desktop][parent.id] = {
      gridTemplateColumns: [300, 400, 500],
      gridTemplateRows: [50, 100, 200],
    };

    expect(updateGrid(page as any, elementDef)).toEqual(elementDef);
    expect(page.stylesheets[PebScreen.Desktop][elementDef.id]).toEqual({
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      position: 'absolute',
      top: 50,
      left: 300,
    } as any);

    /**
     * elementStyles.gridArea, marginTop & marginLeft are set
     */
    page.stylesheets[PebScreen.Desktop][elementDef.id] = {
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      gridArea: '1 / 3',
      position: null,
      marginTop: 25,
      marginLeft: 45,
    } as any;

    expect(updateGrid(page as any, elementDef)).toEqual(elementDef);
    expect(page.stylesheets[PebScreen.Desktop][elementDef.id]).toEqual({
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      position: 'absolute',
      top: 25,
      left: 745,
    } as any);

    /**
     * elementDef.type is PebElementType.Section
     * elementDef.children is []
     * elementStyles.gridTemplateRows is null
     */
    elementDef.type = PebElementType.Section;
    page.stylesheets[PebScreen.Desktop][elementDef.id] = {
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      gridTemplateRows: null,
      height: 300,
    } as any;

    expect(updateGrid(page as any, elementDef)).toEqual(elementDef);
    expect(page.stylesheets[PebScreen.Desktop][elementDef.id]).toEqual({
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      height: 300,
    } as any);

    /**
     * elementDef.children is set
     * elementStyles.gridTemplateRows is set
     */
    elementDef.children = [
      { id: 'child-001' },
      { id: 'child-002' },
    ];
    page.stylesheets[PebScreen.Desktop][elementDef.id] = {
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      gridTemplateRows: '100 350 200',
    } as any;

    expect(updateGrid(page as any, elementDef)).toEqual(elementDef);
    expect(page.stylesheets[PebScreen.Desktop][elementDef.id]).toEqual({
      ...page.stylesheets[PebScreen.Desktop][elementDef.id],
      height: 650,
    } as any);

  });

});
