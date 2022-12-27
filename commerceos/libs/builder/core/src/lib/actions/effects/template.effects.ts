import { cloneDeep, merge } from 'lodash';

import { PebTemplateEffect } from '../../models/action';
import { PebTemplate } from '../../models/client';
import { PebElementDef, PebElementId } from '../../models/element';
import { pebFilterElementDeep, pebFindElementDeep, pebMapElementDeep } from '../../utils/element-utils';

export const layoutsScopeName = 'layouts';

export interface PebAppendElementPayload {
  to: string;
  before?: string;
  element: PebElementDef;
}

export interface PebRelocateElementPayload {
  nextParentId: string;
  elementId: PebElementId;
}

export const pebLayoutEffectHandlers: {
  [effectName in PebTemplateEffect]: (prevLayout: null| PebTemplate, payload: any) => PebTemplate | null
} = {
  [PebTemplateEffect.Init]: pebLayoutInitHandler,
  [PebTemplateEffect.Destroy]: pebLayoutDestroyHandler,
  [PebTemplateEffect.AppendElement]: pebLayoutAppendElementHandler,
  [PebTemplateEffect.UpdateElement]: pebLayoutUpdateElementHandler,
  [PebTemplateEffect.PatchElement]: pebLayoutPatchElementHandler,
  [PebTemplateEffect.RelocateElement]: pebLayoutRelocateElementHandler,
  [PebTemplateEffect.DeleteElement]: pebLayoutDeleteElementHandler,
};

function pebLayoutInitHandler(prevLayout: PebTemplate | null, payload: PebTemplate): PebTemplate {
  return payload;
}

function pebLayoutDestroyHandler(): PebTemplate {
  return null;
}

function pebLayoutAppendElementHandler(prevLayout: PebTemplate, payload: PebAppendElementPayload): PebTemplate {
  return pebMapElementDeep(
    prevLayout,
    (el) => {
      if (payload?.before && el?.children && el?.children.map(child => child.id).includes(payload.before)) {
        const getAfterElInd = el.children.findIndex(child => child.id === payload.before);
        el.children.splice(getAfterElInd, 0, payload.element);

        return el;
      }

      return el?.id === payload.to ? { ...el, children: [...el.children, payload.element] } : el;
    },
  ) as PebTemplate;
}

function pebLayoutUpdateElementHandler(prevLayout: PebTemplate, payload: PebElementDef): PebTemplate {
  const result = pebMapElementDeep(
    prevLayout,
    el => el?.id === payload?.id ? payload : el,
  );

  return result;
}

function pebLayoutPatchElementHandler(prevLayout: PebTemplate, payload: PebElementDef): PebTemplate {
  const removeNull = (object) => {
    Object.entries(object).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        removeNull(value);
      }
      if (value === null) {
        delete object[key];
      }
    });

    return object;
  };

  const cleanObject = (object) => {
    removeNull(object.data);

    return object;
  };

  const result = pebMapElementDeep(
    prevLayout,
    el => el?.id === payload?.id ? cleanObject(merge(cloneDeep(el), payload)) : el,
  );

  return result;
}

function pebLayoutRelocateElementHandler(prevLayout: PebTemplate, payload: PebRelocateElementPayload) {
  const element = pebFindElementDeep(prevLayout, el => el?.id === payload.elementId);

  if (!element) {
    console.warn(`There is no element with id: ${payload.elementId} in layout`);

    return prevLayout;
  }

  return pebMapElementDeep(
    prevLayout,
    (el) => {
      if (el?.children?.length && el?.children.find(e => e.id === element.id)) {
        return { ...el, children: el?.children.filter(e => e.id !== element.id) };
      }

      return el?.id === payload.nextParentId ? { ...el, children: [...el?.children, element] } : el;
    },
  ) as PebTemplate;
}

function pebLayoutDeleteElementHandler(prevLayout: PebTemplate, payload: PebElementId): PebTemplate {
  return pebFilterElementDeep(prevLayout, c => c?.id !== payload) as PebTemplate;
}
