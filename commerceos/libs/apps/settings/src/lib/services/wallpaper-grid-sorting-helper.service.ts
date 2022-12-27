import { Injectable } from '@angular/core';

import {
  EMAIL_ASC,
  EMAIL_DESC,
  NAME_ASC,
  NAME_DESC,
  POSITION_ASC,
  POSITION_DESC,
  STATUS_ASC,
  STATUS_DESC,
} from '../components/employees/constants';
import { GridSortingFieldsEnum } from '../components/employees/enums/grid-sorting-fields.enum';
import { DirectionsEnum } from '../misc/enum';

@Injectable()
export class PebWallpaperGridSortHelperService {
  private readonly fieldCallsCount: Map<GridSortingFieldsEnum, number> = new Map<GridSortingFieldsEnum, number>();

  private readonly sortingFnMapper = {
    [`${GridSortingFieldsEnum.Name}${DirectionsEnum.Asc}`]: NAME_ASC,
    [`${GridSortingFieldsEnum.Name}${DirectionsEnum.Desc}`]: NAME_DESC,

    [`${GridSortingFieldsEnum.Email}${DirectionsEnum.Asc}`]: EMAIL_ASC,
    [`${GridSortingFieldsEnum.Email}${DirectionsEnum.Desc}`]: EMAIL_DESC,

    [`${GridSortingFieldsEnum.Position}${DirectionsEnum.Asc}`]: POSITION_ASC,
    [`${GridSortingFieldsEnum.Position}${DirectionsEnum.Desc}`]: POSITION_DESC,

    [`${GridSortingFieldsEnum.Status}${DirectionsEnum.Asc}`]: STATUS_ASC,
    [`${GridSortingFieldsEnum.Status}${DirectionsEnum.Desc}`]: STATUS_DESC,
  };

  constructor() {
    this.fieldCallsCount
      .set(GridSortingFieldsEnum.Email, 0)
      .set(GridSortingFieldsEnum.Name, 0)
      .set(GridSortingFieldsEnum.Position, 0)
      .set(GridSortingFieldsEnum.Status, 0);
  }

  getSortingFunctionByType(type: GridSortingFieldsEnum) {
    let calls = this.fieldCallsCount.get(type);
    const direction = calls % 2 ? DirectionsEnum.Asc : DirectionsEnum.Desc;
    calls += 1;
    this.fieldCallsCount.set(type, calls);
    const fnKey = `${type}${direction}`;
    const fn = this.sortingFnMapper[fnKey];

    return  fn || (() => 0);
  }
}
