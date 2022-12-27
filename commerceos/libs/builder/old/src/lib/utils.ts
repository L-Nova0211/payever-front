import { FormGroup } from '@angular/forms';
import { ApmService } from '@elastic/apm-rum-angular';
import { chunk, cloneDeep } from 'lodash';

import {
  PebElementDef,
  PebElementId,
  PebElementKit,
  PebElementKitDeep,
  PebElementTransformationDeep,
  PebElementType,
  pebGenerateId,
  PebScreen,
  PebThemePageInterface,
} from '@pe/builder-core';
// import { PebEditorElement, PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebAbstractElement, PebRTree } from '@pe/builder-renderer';

export const BG_GRADIENT = 'linear-gradient';

export function hexToRgba(hexString: string, opacity: number) {
  const arr = chunk(hexString.replace('#', '').split(''), 2);

  return `rgba(${arr.reduce(
    (acc, elem) => `${acc + parseInt(elem.join(''), 16)}, `,
    '',
  )}${opacity / 100})`;
}

export function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);

    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function isBackgroundGradient(backgroundImage?: any, form?: FormGroup): boolean {
  let bgImg = '' as any;
  if (backgroundImage) {
    bgImg = backgroundImage;
  } else if (form && form.get('bgImage')) {
    bgImg = form.get('bgImage').value;
  }

  /***
   * fix: These are temporary fixes until these features are removed.
   */
  if (!!bgImg?.changingThisBreaksApplicationSecurity) {
    bgImg = bgImg.changingThisBreaksApplicationSecurity;
  }

  return !!bgImg?.includes(BG_GRADIENT);
}

export const toBase64 = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

export function excludeChildrenFromElement(
  parent: any, // PebEditorElement
  exclude: PebElementId[],
  renderer: any, // PebEditorRenderer
  screen: PebScreen,
): PebElementTransformationDeep {
  const styleChanges = {};
  const excludeChildrenDeep = (elementDef: PebElementDef): PebElementDef => {
    const result = cloneDeep(elementDef);

    result.children = result.children.reduce(
      (accC, child) => {
        const handledChild = excludeChildrenDeep(child);
        if (exclude.includes(handledChild.id)) {

          return [...accC, ...handledChild.children];
        }
        accC.push(handledChild);

        return accC;
      },
      [],
    );

    return result;
  };

  return { styles: { [screen]: styleChanges }, definition: excludeChildrenDeep(parent.definition) };
}

export function checkElements(elements: string[] | string, apmService: ApmService): void {
  const falseyElements = Array.isArray(elements)
    ? !!elements.filter(el => !el).length
    : !elements;

  try {
    if (falseyElements) {
      throw new Error('Selected elements contain falsey values');
    }
  } catch (err) {
    apmService.apm.captureError(`Elements containing falsey values: ${JSON.stringify(elements)},
    \nError: ${JSON.stringify(err)}
    `);
  }
}
