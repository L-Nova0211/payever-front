import Delta from 'quill-delta';

import { PebScreen, PebTextJustify } from '../constants';
import { PebLanguage } from '../models/client';
import { PebElementType, PebFunctionType } from '../models/element';
import { PebInteractionType } from '../utils';

import {
  applyMigrations,
  applyRecursive,
  migrations,
  shapeMigrations,
  shapeRecursive,
  updateElementDef,
} from './migrations';

describe('Migrations', () => {

  it('should apply recursive', () => {

    const spies = Object.keys(migrations).map(funcNumber => spyOn(migrations, parseInt(funcNumber, 10)));
    const elem = {
      id: 'elem',
      type: PebElementType.Shape,
      data: {
        version: Number(Object.keys(migrations).slice(-1)),
      },
      children: [
        {
          id: 'child-001',
          type: PebElementType.Shape,
          data: null,
        },
        {
          id: 'child-002',
          type: PebElementType.Shape,
          data: {
            version: Number(Object.keys(migrations).slice(-2, -1)),
          },
        },
      ],
    };
    const page: any = { id: 'p-001' };

    applyRecursive(page, [elem]);

    expect(spies.slice(-1)[0].calls.allArgs()).toEqual([
      [page, elem.children[0]],
      [page, elem.children[1]],
    ]);
    spies.slice(0, spies.length - 1).forEach(spy => expect(spy).toHaveBeenCalledOnceWith(page, elem.children[0]));

  });

  it('should apply migrations', () => {

    const spies = Object.keys(migrations).map(funcNumber => spyOn(migrations, parseInt(funcNumber, 10)));
    const pages = {
      'p-001': {
        id: 'p-001',
        template: null,
      },
      'p-002': {
        id: 'p-002',
        template: {
          id: 'tpl-002',
          children: [{
            id: 'child-001',
            type: PebElementType.Shape,
            data: null,
          }],
        },
      },
    };

    applyMigrations({ pages: Object.values(pages) } as any);

    spies.forEach(spy => expect(spy).toHaveBeenCalledOnceWith(pages['p-002'] as any, pages['p-002'].template.children[0] as any));

  });

  it('should update element def', () => {

    const elem = {
      id: 'elem',
      type: PebElementType.Section,
      data: null,
      children: [
        {
          id: 'child-001',
          type: PebElementType.Shape,
          data: {
            linkTo: {
              integration: { id: 'i-001' },
              link: { type: PebInteractionType.NavigateInternal },
            },
          },
          children: [],
        },
        {
          id: 'child-002',
          type: PebElementType.Shape,
          data: {
            linkTo: {
              integration: { id: 'i-001' },
              link: { type: PebInteractionType.NavigateInternal },
              data: { test: 'data' },
            },
            text: 'test.text',
          },
          children: [],
        },
        {
          id: 'child-003',
          type: PebElementType.Text,
          data: {
            text: {
              [PebScreen.Desktop]: {
                [PebLanguage.English]: new Delta([{ insert: 'test.english' }]),
              },
            },
            textAutosize: null,
          },
          children: [],
        },
        {
          id: 'child-004',
          type: PebElementType.Text,
          data: {
            text: 'test.text',
          },
          children: [],
        },
        {
          id: 'child-005',
          type: PebElementType.Shape,
          data: {
            text: {
              [PebScreen.Desktop]: {
                [PebLanguage.English]: new Delta([{ insert: 'test.english' }]),
              },
            },
            textAutosize: null,
          },
          children: [],
        },
      ],
    };

    expect(updateElementDef(elem as any)).toEqual(elem as any);
    expect(elem.children).toEqual([
      {
        id: 'child-001',
        type: PebElementType.Shape,
        data: {
          text: {
            [PebScreen.Desktop]: {
              [PebLanguage.Generic]: new Delta({
                ops: [
                  { insert: '' },
                  { insert: '\n', attributes: { align: PebTextJustify.Center } },
                ],
              }),
            },
          },
          functionLink: {
            integration: { id: 'i-001' },
            functionType: PebFunctionType.Data,
          },
        },
        children: [],
      },
      {
        id: 'child-002',
        type: PebElementType.Shape,
        data: {
          text: {
            [PebScreen.Desktop]: {
              [PebLanguage.Generic]: new Delta({
                ops: [
                  { insert: 'test.text' },
                  { insert: '\n', attributes: { align: PebTextJustify.Center } },
                ],
              }),
            },
          },
          functionLink: {
            integration: { id: 'i-001' },
            functionType: PebFunctionType.Data,
            test: 'data',
          },
        },
        children: [],
      },
      {
        id: 'child-003',
        type: PebElementType.Text,
        data: {
          text: {
            [PebScreen.Desktop]: {
              [PebLanguage.Generic]: new Delta({
                ops: [{ insert: 'test.english' }],
              }),
            },
          },
          textAutosize: { height: true, width: true },
        },
        children: [],
      },
      {
        id: 'child-004',
        type: PebElementType.Text,
        data: {
          text: {
            [PebScreen.Desktop]: {
              [PebLanguage.Generic]: new Delta({
                ops: [
                  { insert: 'test.text' },
                  { insert: '\n' },
                ],
              }),
            },
          },
          textAutosize: { height: true, width: true },
        },
        children: [],
      },
      {
        id: 'child-005',
        type: PebElementType.Shape,
        data: {
          text: {
            [PebScreen.Desktop]: {
              [PebLanguage.Generic]: new Delta({
                ops: [{ insert: 'test.english' }],
              }),
            },
          },
          textAutosize: null,
        },
        children: [],
      },
    ] as any[]);

  });

  it('should shape recursive', () => {

    const value = {
      element: {
        id: 'elem',
        type: PebElementType.Shape,
        data: null,
        children: [],
      },
      styles: {
        [PebScreen.Desktop]: { height: 40 },
      },
      children: null,
    };

    /**
     * value.element.type is PebElementType.Shape
     * value.children is null
     */
    expect(shapeRecursive(value as any)).toEqual(value as any);
    expect(value.element).toEqual({
      ...value.element,
      data: {
        text: {
          [PebScreen.Desktop]: {
            [PebLanguage.Generic]: new Delta([
              { insert: '' },
              { insert: '\n', attributes: { align: PebTextJustify.Center } },
            ]),
          },
        },
      },
    });

    /**
     * value.element.type is PebElementType.Text
     * value.styles[PebScreen.Desktop].height is 40
     * value.children is set
     */
    value.element.type = PebElementType.Text;
    value.element.data = null;
    value.children = [{
      element: {
        id: 'child-001',
        type: PebElementType.Shape,
        data: {
          text: 'test.text',
        },
        children: [],
      },
      styles: {},
      children: null,
    }];

    expect(shapeRecursive(value as any)).toEqual(value as any);
    expect(value.element).toEqual({
      id: 'elem',
      type: PebElementType.Text,
      data: null,
      children: [],
    });
    expect(value.styles[PebScreen.Desktop].height).toBe(41);
    expect(value.children[0].element).toEqual({
      id: 'child-001',
      type: PebElementType.Shape,
      data: {
        text: {
          [PebScreen.Desktop]: {
            [PebLanguage.Generic]: new Delta([
              { insert: 'test.text' },
              { insert: '\n', attributes: { align: PebTextJustify.Center } },
            ]),
          },
        },
      },
      children: [],
    });

  });

  it('should shape migrations', () => {

    const value = [
      {
        elementKit: {
          element: {
            id: 'elem-001',
            type: PebElementType.Text,
            data: null,
            children: [],
          },
          styles: {
            [PebScreen.Desktop]: { height: 40 },
          },
        },
      },
      {
        elementKit: {
          element: {
            id: 'elem-002',
            type: PebElementType.Shape,
            data: null,
            children: [],
          },
          styles: {
            [PebScreen.Desktop]: { height: 40 },
          },
        },
      },
    ];

    /**
     * argument value is array
     */
    expect(shapeMigrations(value as any)).toEqual(value as any);
    expect(value).toEqual([
      {
        elementKit: {
          element: {
            id: 'elem-001',
            type: PebElementType.Text,
            data: null,
            children: [],
          },
          styles: {
            [PebScreen.Desktop]: { height: 41 },
          },
        },
      },
      {
        elementKit: {
          element: {
            id: 'elem-002',
            type: PebElementType.Shape,
            data: {
              text: {
                [PebScreen.Desktop]: {
                  [PebLanguage.Generic]: new Delta([
                    { insert: '' },
                    { insert: '\n', attributes: { align: PebTextJustify.Center } },
                  ]),
                },
              },
            },
            children: [],
          },
          styles: {
            [PebScreen.Desktop]: { height: 40 },
          },
        },
      },
    ]);

    /**
     * argument value is NOT array
     */
    expect(shapeMigrations(value[0] as any)).toEqual(value[0] as any);
    expect(value[0]).toEqual({
      elementKit: {
        element: {
          id: 'elem-001',
          type: PebElementType.Text,
          data: null,
          children: [],
        },
        styles: {
          [PebScreen.Desktop]: { height: 41 },
        },
      },
    });

  });

});
