import { WallpaperViewEnum } from '../enum';

export interface WallpaperTreeInterface {
  name: string;
  folder: WallpaperViewEnum;
  _id: string;
  isHideMenu?: boolean;
  editMode?: boolean;
  children: WallpaperTreeInterface[];
}

export interface WallpaperTreeChildrenInterface {
  category: string;
  name: string;
  image: string;
  _id: string;
  isHideMenu?: boolean;
  data?: any;
  children: WallpaperTreeInterface[];
}
