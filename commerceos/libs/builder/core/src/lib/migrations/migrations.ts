import Delta from 'quill-delta';

import { PebScreen, PebTextJustify } from '../constants';
import { PebLanguage, PebTemplate } from '../models/client';
import { PebThemeDetailInterface, PebThemePageInterface } from '../models/database';
import { PebElementKitDeep } from '../models/editor';
import {
  PebElementDef,
  PebElementDefMeta,
  PebElementType,
} from '../models/element';
import { PebShapesShape } from '../models/shapes';


import { bgImagesMetadata } from './bg-images-metadata.migration';
import { blockToShape } from './block-to-shape.migration';
import { cleanUpStyles } from './cleanup-styles.migration';
import { collectFonts } from './collect-fonts.migration';
import { elementLinkNoneToObject } from './element-link-none.migration';
import { elementLinkToObject } from './element-link.migration';
import { fixParent } from './fix-parent.migrations';
import { generateProductGrid } from './generate-product-grid.migration';
import { gridAlignText } from './grid-align.migration';
import { gridProductPrice } from './grid-product-price.migration';
import { gridTemplatesToNumberArray, parseGridTemplate } from './grid-template.migration';
import { loader } from './integration.loader';
import { linkColorReset } from './link-color-reset.migration';
import { getFunctionType, linkToToFunctionLink } from './link-to-function-link.migration';
import { PebMigration } from './migrations.interface';
import { newProductGrid } from './new-product-grid.migration';
import { productSlugMetaMigration } from './product-slug-meta.migration';
import { removeBold } from './remove-bold.migration';
import { removeGroupElements } from './remove-group.migration';
import { removeLegacyElements } from './remove-legacy-elements';
import { removePercentDimensions } from './remove-percent-dimensions';
import { textAutosize } from './text-autosize.migration';
import { textToDelta } from './text-to-delta.migration';
import { updateFilterSort } from './update-filter-sort.migration';
import { updateGrid } from './update-grid.migration';

export const migrations: { [key: number]: PebMigration } = {
  1: textToDelta,
  2: collectFonts,
  3: textAutosize,
  4: gridProductPrice,
  5: blockToShape,
  6: fixParent,
  7: updateGrid,
  8: linkToToFunctionLink,
  9: gridAlignText,
  10: linkColorReset,
  11: removePercentDimensions,
  12: elementLinkToObject,
  13: blockToShape,
  14: elementLinkToObject,
  15: blockToShape,
  16: removeLegacyElements,
  17: gridTemplatesToNumberArray,
  19: removeBold,
  20: productSlugMetaMigration,
  21: removeGroupElements,
  22: bgImagesMetadata,
  23: cleanUpStyles,
  24: newProductGrid,
  31: removeGroupElements,
  32: updateFilterSort,
  33: elementLinkNoneToObject,
};

export async function applyRecursive<T extends PebElementDef | PebTemplate>(
  page: PebThemePageInterface,
  element: T,
  environment?: any,
) {

  if (environment && !loader.environment) {
    loader.environment = environment;
  }

  const children = element.children?.filter((elm) => {
    return !!elm && elm.id && elm.type && [ ...Object.values(PebElementType), 'block'].includes(elm.type);
  }) ?? [];

  element.children = await Promise.all(children.map(async (elm) => {
    return await applyRecursive(page, elm, environment);
  }));

  const lastMigrationVersion = Number(Object.keys(migrations).slice(-1));

  if (element.data?.version === lastMigrationVersion) {
    return element;
  }

  await Promise.all(Object.entries(migrations).map(async ([key, value]) => {
    if (element.data?.version === undefined || element.data.version < Number(key)) {
      try {
        await value(page, element);
      } catch (e) {
        console.error(`Migration #${key} error`, e);
      }
    }
  }));

  /** Enable when run migrations on backend */
  // element.data = {
  //   ...(element.data || {}),
  //   version: lastMigrationVersion,
  // };

  return element;
}

export async function applyMigrations(
  snapshot: PebThemeDetailInterface,
  environment: any,
): Promise<PebThemeDetailInterface> {
  await Promise.all(snapshot.pages.map(async (page: PebThemePageInterface) => {
    if (page.template) {
      page.template = await applyRecursive(page, page.template, environment);
    }
  }));

  return snapshot;
}

export function updateElementDef(element: PebElementDef): PebElementDef {

  if (!element.data?.text && element.type === PebElementType.Shape) {
    element.data = {
      ...element.data,
      text: {
        ...element.data?.text,
        [PebScreen.Desktop]: {
          [PebLanguage.Generic]: new Delta([
            { insert: '' },
            { insert: '\n', attributes: { align: 'center' } },
          ]),
        },
      },
    };
  }

  if (element.data?.text !== undefined) {
    /** Create text content for generic language */
    Object.values(PebScreen).forEach((screen) => {
      if (element.type === PebElementType.Text && !element.data.textAutosize) {
        element.data.textAutosize = { height: true, width: true };
      }

      if (typeof element.data.text === 'string') {
        const newLine = element.type === PebElementType.Shape
          ? { insert: '\n', attributes: { align: PebTextJustify.Center } }
          : { insert: '\n' };
        const delta = new Delta([{ insert: element.data.text }, newLine]);
        element.data = {
          ...element.data,
          text: { [PebScreen.Desktop]: { [PebLanguage.Generic]: delta } },
        };
      }

      if (!element.data.text[screen]?.[PebLanguage.Generic] && element.data.text[screen]?.[PebLanguage.English]) {
        if (element.type === PebElementType.Text) {element.data.textAutosize = { height: true, width: true };}

        element.data.text = {
          ...element.data.text,
          ...{ [screen]: { [PebLanguage.Generic]: element.data.text[screen][PebLanguage.English] } },
        };

        delete element.data.text[screen][PebLanguage.English];
      }

      /** Force text justify to center for shape elements if not set */
      if (element.type === PebElementType.Shape) {
        Object.values(PebLanguage).forEach((language) => {
          if (element.data.text[screen]?.[language]) {
          }
        });
      }
    });
  }

  if (element.data?.linkTo) {
    const functionLink = element.data.linkTo;
    const { integration, interaction, action, link: data } = functionLink;
    const functionType = getFunctionType(functionLink);

    if (data) {
      data.dataType = data.linkType;
      data.contextIntegration = data.contextEntity;
    }

    const { links: integrationData, ...integrationRest } = integration;

    element.data.functionLink = {
      ...(action || data || interaction),
      functionType,
      integration: {
        ...integrationRest,
        data: integrationData.map((dataLink) => {
          const { linkType: dataType, ...rest } = dataLink;

          return {
            ...rest,
            dataType,
            contextIntegration: rest.contextEntity,
          };
        }),
      },
    };

    delete element.data.linkTo;
    delete (element.data.functionLink as any).linkType;
    delete (element.data.functionLink as any).link;
  }

  element.children.forEach(elm => updateElementDef(elm));

  return element;
}

export function shapeRecursive(value: PebElementKitDeep): PebElementKitDeep {
  if (value.element.type === PebElementType.Text && value.styles?.desktop?.height === 40) {
    value.styles.desktop.height = 41;
  }

  if (value.element.type === PebElementType.Grid) {

    Object.values(PebScreen).forEach((screen) => {
      const style = value.styles[screen];

      if (style.gridTemplateColumns || style.gridTemplateRows) {
        const { colCount = 1, rowCount = 1 } = value.element.data;
        const { width, height } = style;

        if (style.gridTemplateColumns) {
          style.gridTemplateColumns = style.gridTemplateColumns
            ? typeof style.gridTemplateColumns === 'string'
              ? parseGridTemplate(style.gridTemplateColumns as any as string, style.width)
              : style.gridTemplateColumns
            : Array.from({ length: colCount }, () => width / colCount);
        }

        if (style.gridTemplateRows) {
          style.gridTemplateRows = style.gridTemplateRows
            ? typeof style.gridTemplateRows === 'string'
              ? parseGridTemplate(style.gridTemplateRows as any as string, style.height)
              : style.gridTemplateRows
            : Array.from({ length: rowCount }, () => height / rowCount);
        }

        value.styles[screen] = style;
      }
    })
  } else {
    Object.values(PebScreen).forEach((screen) => {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        gridArea,
        transform,
        margin,
        marginLeft,
        marginTop,
        marginRight,
        marginBottom,
        minHeight,
        minWidth,
        content,
        position,
        ...style
      } = value.styles[screen];
      /* eslint-enable @typescript-eslint/no-unused-vars */
      if (style?.width === '100%') {
        delete style.width;
      }
      if (style?.height === '100%') {
        delete style.height;
      }
      if (style?.backgroundImage === '') {
        delete style.backgroundImage;
      }

      const isCircle = style?.height === style?.width && style?.borderRadius === style.height / 2;

      let isLine = false;
      if (style?.height && style?.width) {
        const minSide = Math.min(style.height, style.width);
        const maxSide = Math.max(style.height, style.width);

        isLine = minSide <= 10 && minSide < (maxSide / 100 * 6);
      }

      if (isCircle || isLine) {
        if (!value.element.meta) { value.element.meta = { } as PebElementDefMeta;}
        value.element.meta.borderRadiusDisabled = true;
      }

      value.styles[screen] = style;
    });
  }

  value.element = updateElementDef(value.element);
  value.children?.map(s => shapeRecursive(s));

  return value;
}

export async function shapeMigrations(value: PebShapesShape, environment?: any): Promise<PebShapesShape>;
export async function shapeMigrations(value: PebShapesShape[], environment?: any): Promise<PebShapesShape[]>;
export async function shapeMigrations(value, environment) {
  if (Array.isArray(value)) {
    value.forEach((shape) => {
      shape.elementKit = shapeRecursive(shape.elementKit);
    });

    if (value.length && value.some(shape => shape.basic)) {
      value.push(await generateProductGrid(value[0].album, environment));
    }
  } else {
    value.elementKit = shapeRecursive(value.elementKit);
  }

  return value;
}
