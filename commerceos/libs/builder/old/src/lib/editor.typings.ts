import { PebElementId, PebScreen } from '@pe/builder-core';

export interface PebDOMRect {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  offsetLeft: number;
  offsetTop: number;
}

export type elementManipulation = 'delete' | 'copy' | 'paste' | 'group' | 'ungroup';

export interface ElementManipulation {
  selectedElements?: PebElementId[];
  type: elementManipulation;
  screen?: PebScreen;
}

export interface SectionManipulation {
  selectedElements?: PebElementId[];
  lastMovedSection?: PebElementId;
  screen?: PebScreen;
}
