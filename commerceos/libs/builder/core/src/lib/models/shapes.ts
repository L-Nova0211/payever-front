import { PebScreen } from '../constants';

import { PebElementKitDeep } from './editor';
import { PebElementType } from './element';

export interface PebShapesAlbum {
  id: string;
  application: string;
  name: string;
  parent: string;
  image?: string;
  type: string | PebElementType;
  updatedAt?: string;
  createdAt?: string;
  children?: PebShapesAlbum[];
  basic?: true;
}

export interface PebShapesShape {
  id: string;
  elementKit?: PebElementKitDeep;
  title?: string;
  description?: string;
  album?: string;
  screen?: PebScreen;
  updatedAt?: string;
  createdAt?: string;
  image?: string;
  basic?: boolean;
  generated?: boolean;
}
