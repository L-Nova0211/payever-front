import { BehaviorSubject } from 'rxjs';

import { PeGridItemColumn, PeGridItemType } from '@pe/grid';

import { WallpaperDataInterface } from '../../services';
import { WalpaperType } from '../enum';

export interface WallpaperGridItemInterface {
  wallpaperType?:WalpaperType
  action?: {
    label: string;
    backgroundColor?: string;
    color?: string;
  };
  badge?: {
    backgroundColor: string;
    color: string;
    label?: string;
    componentCell?: any;
  };
  columns: PeGridItemColumn[];
  id: string | WallpaperDataInterface;
  image: string;
  title: string;
  type: PeGridItemType;
  isDraggable?: boolean;
  data?: any;
  itemLoader$?: BehaviorSubject<boolean>;
  wallpaper?: WallpaperDataInterface;
  position?: number;
}
