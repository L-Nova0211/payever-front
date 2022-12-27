import { PositionsEnum } from '../../../misc/enum/positions.enum';

export interface PositionTreeDataInterface {
  isFolder: boolean;
  category: PositionsEnum;
}

export interface GroupTreeDataInterface {
  isFolder: boolean;
  category: string;
}
