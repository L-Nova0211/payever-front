import { PebElementDef, PebElementId, PebElementType, PebTextContent } from '@pe/builder-core';

export enum PebShapeVariant {
  Circle = 'circle',
  Square = 'square',
  Triangle = 'triangle',
}

export interface PebElementShape extends PebElementDef {
  id: PebElementId;
  type: PebElementType.Shape;
  data: {
    text?: PebTextContent;
    variant: PebShapeVariant;
    [key: string]: any,
  };
  children: null;
}
