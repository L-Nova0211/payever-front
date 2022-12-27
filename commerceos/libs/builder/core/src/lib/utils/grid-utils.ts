import { PebElementStyles } from '../models/client';

export enum PebGridElementBorder {
  Right = 'right',
  Top = 'top',
  Left = 'left',
  Bottom = 'bottom',
  InnerHorizontal = 'inner-horizontal',
  InnerVertical = 'inner-vertical',
}

export type PebGridElementBorders = { [border in PebGridElementBorder]: boolean };

export enum PebGridElementBorderOption {
  None = 'none',
  OuterAll = 'outer-all',
  InnerAll = 'inner-all',
  All = 'all',
  OuterLeft = 'outer-left',
  InnerVertical = 'inner-vertical',
  OuterRight = 'outer-right',
  OuterTop = 'outer-top',
  InnerHorizontal = 'inner-horizontal',
  OuterBottom = 'outer-bottom',
}

export function getPebGridElementBorderOptionsChanges(
  borderOptions: PebGridElementBorders,
  borderOption: PebGridElementBorderOption,
  value?: boolean,
): Partial<PebGridElementBorders> {
  if (!borderOption) {
    return {};
  }
  const result = { ...borderOptions };
  if (borderOption === PebGridElementBorderOption.All) {
    return getPebGridElementBorderOptions(
      Object.values(PebGridElementBorder).every(border => !!borderOptions[border]) ?
        PebGridElementBorderOption.None : PebGridElementBorderOption.All,
    );
  }
  const changes = pebGridElementBorderOptionsChanges?.[borderOption] ?? {};
  Object.keys(changes).forEach((border) => {
    result[border] = value === undefined ? !!result[border] : value;
  });

  return result;
}

const pebGridElementBorderOptionsChanges: { [option in PebGridElementBorderOption]: Partial<PebGridElementBorders> } = {
  [PebGridElementBorderOption.None]: {
    [PebGridElementBorder.Right]: false,
    [PebGridElementBorder.Top]: false,
    [PebGridElementBorder.Left]: false,
    [PebGridElementBorder.Bottom]: false,
    [PebGridElementBorder.InnerHorizontal]: false,
    [PebGridElementBorder.InnerVertical]: false,
  },
  [PebGridElementBorderOption.OuterAll]: {
    [PebGridElementBorder.Right]: true,
    [PebGridElementBorder.Top]: true,
    [PebGridElementBorder.Left]: true,
    [PebGridElementBorder.Bottom]: true,
  },
  [PebGridElementBorderOption.InnerAll]: {
    [PebGridElementBorder.InnerHorizontal]: true,
    [PebGridElementBorder.InnerVertical]: true,
  },
  [PebGridElementBorderOption.All]: {
    [PebGridElementBorder.Right]: true,
    [PebGridElementBorder.Top]: true,
    [PebGridElementBorder.Left]: true,
    [PebGridElementBorder.Bottom]: true,
    [PebGridElementBorder.InnerHorizontal]: true,
    [PebGridElementBorder.InnerVertical]: true,
  },
  [PebGridElementBorderOption.OuterLeft]: {
    [PebGridElementBorder.Left]: true,
  },
  [PebGridElementBorderOption.OuterRight]: {
    [PebGridElementBorder.Right]: true,
  },
  [PebGridElementBorderOption.OuterBottom]: {
    [PebGridElementBorder.Bottom]: true,
  },
  [PebGridElementBorderOption.OuterTop]: {
    [PebGridElementBorder.Top]: true,
  },
  [PebGridElementBorderOption.InnerHorizontal]: {
    [PebGridElementBorder.InnerHorizontal]: true,
  },
  [PebGridElementBorderOption.InnerVertical]: {
    [PebGridElementBorder.InnerVertical]: true,
  },
};

export function getPebGridElementBorderOptions(borderOption: PebGridElementBorderOption): PebGridElementBorders {
  return pebGridElementBorderOptions[borderOption] ?? pebGridElementBorderOptions[PebGridElementBorderOption.None];
}

const pebGridElementBorderOptions: { [option in PebGridElementBorderOption]: PebGridElementBorders } = {
  [PebGridElementBorderOption.None]: {
    [PebGridElementBorder.Right]: false,
    [PebGridElementBorder.Top]: false,
    [PebGridElementBorder.Left]: false,
    [PebGridElementBorder.Bottom]: false,
    [PebGridElementBorder.InnerHorizontal]: false,
    [PebGridElementBorder.InnerVertical]: false,
  },
  [PebGridElementBorderOption.OuterAll]: {
    [PebGridElementBorder.Right]: true,
    [PebGridElementBorder.Top]: true,
    [PebGridElementBorder.Left]: true,
    [PebGridElementBorder.Bottom]: true,
    [PebGridElementBorder.InnerHorizontal]: false,
    [PebGridElementBorder.InnerVertical]: false,
  },
  [PebGridElementBorderOption.InnerAll]: {
    [PebGridElementBorder.Right]: false,
    [PebGridElementBorder.Top]: false,
    [PebGridElementBorder.Left]: false,
    [PebGridElementBorder.Bottom]: false,
    [PebGridElementBorder.InnerHorizontal]: true,
    [PebGridElementBorder.InnerVertical]: true,
  },
  [PebGridElementBorderOption.All]: {
    [PebGridElementBorder.Right]: true,
    [PebGridElementBorder.Top]: true,
    [PebGridElementBorder.Left]: true,
    [PebGridElementBorder.Bottom]: true,
    [PebGridElementBorder.InnerHorizontal]: true,
    [PebGridElementBorder.InnerVertical]: true,
  },
  [PebGridElementBorderOption.OuterLeft]: {
    [PebGridElementBorder.Right]: false,
    [PebGridElementBorder.Top]: false,
    [PebGridElementBorder.Left]: true,
    [PebGridElementBorder.Bottom]: false,
    [PebGridElementBorder.InnerHorizontal]: false,
    [PebGridElementBorder.InnerVertical]: false,
  },
  [PebGridElementBorderOption.OuterRight]: {
    [PebGridElementBorder.Right]: true,
    [PebGridElementBorder.Top]: false,
    [PebGridElementBorder.Left]: false,
    [PebGridElementBorder.Bottom]: false,
    [PebGridElementBorder.InnerHorizontal]: false,
    [PebGridElementBorder.InnerVertical]: false,
  },
  [PebGridElementBorderOption.OuterBottom]: {
    [PebGridElementBorder.Right]: false,
    [PebGridElementBorder.Top]: false,
    [PebGridElementBorder.Left]: false,
    [PebGridElementBorder.Bottom]: true,
    [PebGridElementBorder.InnerHorizontal]: false,
    [PebGridElementBorder.InnerVertical]: false,
  },
  [PebGridElementBorderOption.OuterTop]: {
    [PebGridElementBorder.Right]: false,
    [PebGridElementBorder.Top]: true,
    [PebGridElementBorder.Left]: false,
    [PebGridElementBorder.Bottom]: false,
    [PebGridElementBorder.InnerHorizontal]: false,
    [PebGridElementBorder.InnerVertical]: false,
  },
  [PebGridElementBorderOption.InnerHorizontal]: {
    [PebGridElementBorder.Right]: false,
    [PebGridElementBorder.Top]: false,
    [PebGridElementBorder.Left]: false,
    [PebGridElementBorder.Bottom]: false,
    [PebGridElementBorder.InnerHorizontal]: true,
    [PebGridElementBorder.InnerVertical]: false,
  },
  [PebGridElementBorderOption.InnerVertical]: {
    [PebGridElementBorder.Right]: false,
    [PebGridElementBorder.Top]: false,
    [PebGridElementBorder.Left]: false,
    [PebGridElementBorder.Bottom]: false,
    [PebGridElementBorder.InnerHorizontal]: false,
    [PebGridElementBorder.InnerVertical]: true,
  },
};

export function getGridCellElementBorders(
  gridElementBorders: PebGridElementBorders,
  index: number,
  { colCount, rowCount }: { colCount: number, rowCount: number },
  borderValue: PebGridBorderStyleProps,
): PebGridCellElementBorders {
  const result = Object.values(PebGridCellElementBorder).reduce(
    (acc, elementBorder) => {
      acc[elementBorder] = null;

      return acc;
    },
    {},
  ) as PebGridCellElementBorders;
  const row = Math.ceil((index + 1) / colCount);
  const col = (index + 1) - (row - 1) * colCount;

  if (gridElementBorders[PebGridElementBorder.InnerVertical]) {
    if (col !== colCount) {
      result.right = borderValue;
    }
  }
  if (gridElementBorders[PebGridElementBorder.InnerHorizontal]) {
    if (row !== rowCount) {
      result.bottom = borderValue;
    }
  }
  if (gridElementBorders[PebGridElementBorder.Top]) {
    if (row === 1) {
      result.top = borderValue;
    }
  }
  if (gridElementBorders[PebGridElementBorder.Bottom]) {
    if (row === rowCount) {
      result.bottom = borderValue;
    }
  }
  if (gridElementBorders[PebGridElementBorder.Left]) {
    if (col === 1) {
      result.left = borderValue;
    }
  }
  if (gridElementBorders[PebGridElementBorder.Right]) {
    if (col === colCount) {
      result.right = borderValue;
    }
  }

  return result;
}

export function createGridCellElementBorderStyles(borders: Partial<PebGridCellElementBorders>): PebElementStyles {
  return Object.entries(borders).reduce((acc, [key, border]) => {
    const capitalized = key.charAt(0).toUpperCase() + key.slice(1);

    return {
      ...acc,
      ...(border && 'color' in border && { [`border${capitalized}Color`]: border.color }),
      ...(border && 'style' in border && { [`border${capitalized}Style`]: border.style }),
      ...(border && 'width' in border && { [`border${capitalized}Width`]: border.width }),
    };
  }, {});
}

export function getGridCellElementBordersChange(changes: PebGridCellElementBorders, index: number, colCount: number): { [index: number]: PebGridCellElementBorders } {
  const result = {};
  result[index] = {};
  const row = Math.floor(index / colCount);
  const col = index - row * colCount;

  if (changes[PebGridCellElementBorder.Top]) {
    if (row > 0) {
      result[(row - 1) * colCount + col] = {
        [PebGridElementBorder.Bottom]: changes[PebGridElementBorder.Top],
      };
    } else {
      result[index][PebGridElementBorder.Top] = changes[PebGridElementBorder.Top];
    }
    if (changes[PebGridElementBorder.Left]) {
      if (col > 0) {
        result[row * colCount + col - 1] = {
          [PebGridElementBorder.Right]: changes[PebGridElementBorder.Left],
        };
      } else {
        result[index][PebGridElementBorder.Left] = changes[PebGridElementBorder.Left];
      }
    }
    if (changes[PebGridElementBorder.Bottom]) {
      result[index][PebGridCellElementBorder.Bottom] = changes[PebGridElementBorder.Bottom];
    }
    if (changes[PebGridElementBorder.Right]) {
      result[index][PebGridCellElementBorder.Right] = changes[PebGridElementBorder.Right];
    }
  }

  return result;
}

export function getGridCellElementBordersSquare({ borderOption, borderStyle, colCount, minCol, minRow, maxCol, maxRow }: {
  borderOption: PebGridElementBorderOption,
  borderStyle: PebGridBorderStyleProps,
  colCount: number,
  minCol: number,
  minRow: number,
  maxCol: number,
  maxRow: number,
}): { [index: number]: Partial<PebGridCellElementBorders> } {
  const result: { [index: number]: Partial<PebGridCellElementBorders> } = {};
  const changes = pebGridElementBorderOptionsChanges[borderOption];
  for (let i = minRow; i <= maxRow; i += 1) {
    for (let j = minCol; j <= maxCol; j += 1) {
      const index = i * colCount + j;
      result[index] = {};
      if (changes[PebGridElementBorder.InnerHorizontal]) {
        if (i !== maxRow) {
          result[index][PebGridCellElementBorder.Bottom] = { ...borderStyle };
        }
        if (i !== minRow) {
          result[index][PebGridCellElementBorder.Top] = { ...borderStyle };
        }
      }
      if (changes[PebGridElementBorder.InnerVertical]) {
        if (j !== maxCol) {
          result[index][PebGridCellElementBorder.Right] = { ...borderStyle };
        }
        if (j !== minCol) {
          result[index][PebGridCellElementBorder.Left] = { ...borderStyle };
        }
      }
      if (changes[PebGridElementBorder.Left]) {
        if (j === minCol) {
          result[index][PebGridCellElementBorder.Left] = { ...borderStyle };
        }
      }
      if (changes[PebGridElementBorder.Right]) {
        if (j === maxCol) {
          result[index][PebGridCellElementBorder.Right] = { ...borderStyle };
        }
      }
      if (changes[PebGridElementBorder.Top]) {
        if (i === minRow) {
          result[index][PebGridCellElementBorder.Top] = { ...borderStyle };
        }
      }
      if (changes[PebGridElementBorder.Bottom]) {
        if (i === maxRow) {
          result[index][PebGridCellElementBorder.Bottom] = { ...borderStyle };
        }
      }
    }
  }

  return result;
}

export function getGridCellElementBordersChanges({ cellElementBorders, index, colCount }: {
  cellElementBorders: Partial<PebGridCellElementBorders>,
  index: number,
  colCount: number,
}): { [i: number]: Partial<PebGridCellElementBorders> } {
  const row = Math.ceil((index + 1) / colCount);
  const col = (index + 1) - (row - 1) * colCount;
  const result: { [i: number]: Partial<PebGridCellElementBorders> } = {
    [index]: {},
  };
  if (cellElementBorders.right) {
    result[index].right = cellElementBorders.right;
  }
  if (cellElementBorders.bottom) {
    result[index].bottom = cellElementBorders.bottom;
  }
  if (cellElementBorders.top) {
    if (row === 1) {
      result[index].top = cellElementBorders.top;
    } else {
      const topCellIndex = index - colCount;
      result[topCellIndex] = {
        bottom: cellElementBorders.top,
      };
    }
  }
  if (cellElementBorders.left) {
    if (col === 1) {
      result[index].left = cellElementBorders.left;
    } else {
      const leftCellIndex = index - 1;
      result[leftCellIndex] = {
        right: cellElementBorders.left,
      };
    }
  }

  return result;
}

export enum PebGridCellElementBorder {
  Right = 'right',
  Top = 'top',
  Left = 'left',
  Bottom = 'bottom',
}

export interface PebGridBorderStyleProps {
  style?: string;
  width?: number;
  color?: string;
}

export type PebGridCellElementBorders = { [border in PebGridCellElementBorder]: PebGridBorderStyleProps };
