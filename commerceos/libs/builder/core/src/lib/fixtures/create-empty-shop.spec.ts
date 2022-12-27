import { merge } from 'lodash';

import { PebScreen } from '../constants';
import { migrations } from '../migrations/migrations';
import { PebLanguage, PebPageType, PebPageVariant } from '../models/client';
import { PebElementType, PebSectionType } from '../models/element';
import * as utils from '../utils/generate-id';

import {
  getPageUrlByName,
  pebCreateEmptyPage,
  pebCreateEmptySections,
  pebCreateEmptyShop,
} from './create-empty-shop';

describe('Fixtures:Create Empty Shop', () => {

  const lastMigrationVersion = Number(Object.keys(migrations).slice(-1));
  const sectionElements = Object.values(PebSectionType).map(type => ({
    id: `gid-${type}`,
    type: PebElementType.Section,
    data: {
      name: type,
      version: lastMigrationVersion,
    },
    meta: {
      deletable: false,
    },
    children: [],
  }));
  const sectionStyles = Object.values(PebScreen).reduce((acc, screen) => {
    acc[screen] = {
      'gid-header': { height: 200 },
      'gid-body': { height: 600 },
      'gid-footer': { height: 200 },
    };

    return acc;
  }, {});

  beforeAll(() => {

    Object.defineProperty(utils, 'pebGenerateId', {
      value: utils.pebGenerateId,
      writable: true,
    });

  });

  it('should create empty sections', () => {

    const idsMock = [
      'gid-header',
      'gid-body',
      'gid-footer',
    ];
    const generateIdSpy = spyOn(utils, 'pebGenerateId').and.returnValues(...idsMock);

    expect(pebCreateEmptySections()).toEqual({
      elements: sectionElements,
      styles: sectionStyles,
    });
    expect(generateIdSpy.calls.allArgs()).toEqual(Array(Object.keys(PebSectionType).length).fill(['element']));

  });

  it('should create empty page', () => {

    const name = 'Page 1';
    const idsMock = [
      'tpl-001',
      'gid-header',
      'gid-body',
      'gid-footer',
      'doc',
      'p-001',
      ...Object.values(PebScreen).map(screen => `${screen.charAt(0)}-001`),
      'ctx-001',
    ];
    const generateIdSpy = spyOn(utils, 'pebGenerateId').and.returnValues(...idsMock);

    /**
     * arguments variant & type are set as default
     */
    expect(pebCreateEmptyPage(name)).toEqual({
      name,
      type: PebPageType.Replica,
      variant: PebPageVariant.Default,
      templateId: 'tpl-001',
      template: {
        children: sectionElements,
        id: 'doc',
        type: PebElementType.Document,
      },
      skip: false,
      id: 'p-001',
      master: null,
      data: {},
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
      stylesheets: merge({
        [PebScreen.Desktop]: {
          doc: { backgroundColor: '#ffffff' },
        },
        [PebScreen.Tablet]: {
          doc: { backgroundColor: '#ffffff' },
        },
        [PebScreen.Mobile]: {
          doc: { backgroundColor: '#ffffff' },
        },
      }, sectionStyles as any),
      contextId: 'ctx-001',
      context: {},
    });
    expect(generateIdSpy.calls.allArgs()).toEqual([
      ['template'],
      ...Array(Object.keys(PebSectionType).length + 1).fill(['element']),
      ['page'],
      ...Array(Object.keys(PebScreen).length).fill(['stylesheet']),
      ['context'],
    ]);

    /**
     * arguments variant & type are set
     */
    generateIdSpy.and.returnValues(...idsMock);

    const { variant, type } = pebCreateEmptyPage(name, PebPageVariant.Product, PebPageType.Master);
    expect(variant).toEqual(PebPageVariant.Product);
    expect(type).toEqual(PebPageType.Master);

  });

  it('should get page url by name', () => {

    const pageName = 'Page 1 (Replica)';

    expect(getPageUrlByName(pageName, PebPageVariant.Front)).toEqual('/');
    expect(getPageUrlByName(pageName).startsWith('/page-1-replica-')).toBe(true);

  });

  it('should create empty shop', () => {

    const idsMock = [
      'tpl-001',
      'gid-header',
      'gid-body',
      'gid-footer',
      'doc',
      'p-001',
      ...Object.values(PebScreen).map(screen => `${screen.charAt(0)}-001`),
      'ctx-001',
      'shop-001',
      'r-001',
    ];


    spyOn(utils, 'pebGenerateId').and.returnValues(...idsMock);

    expect(pebCreateEmptyShop()).toEqual({
      id: 'shop-001',
      data: {
        productPages: '/products/:productId',
        categoryPages: '/categories/:categoryId',
        languages: [
          { language: PebLanguage.English, active: true },
        ],
        defaultLanguage: PebLanguage.English,
      },
      routing: [
        {
          routeId: 'r-001',
          pageId: 'p-001',
          url: '/',
        },
      ],
      context: {},
      pages: [{
        name: 'Front',
        type: PebPageType.Replica,
        variant: PebPageVariant.Front,
        templateId: 'tpl-001',
        template: {
          children: sectionElements,
          id: 'doc',
          type: PebElementType.Document,
        },
        skip: false,
        id: 'p-001',
        master: null,
        data: {},
        stylesheetIds: {
          [PebScreen.Desktop]: 'd-001',
          [PebScreen.Tablet]: 't-001',
          [PebScreen.Mobile]: 'm-001',
        },
        stylesheets: merge({
          [PebScreen.Desktop]: {
            doc: { backgroundColor: '#ffffff' },
          },
          [PebScreen.Tablet]: {
            doc: { backgroundColor: '#ffffff' },
          },
          [PebScreen.Mobile]: {
            doc: { backgroundColor: '#ffffff' },
          },
        }, sectionStyles as any),
        contextId: 'ctx-001',
        context: {},
      }],
    });

  });

});
