import {
  createGridCellElementBorderStyles,
  getGridCellElementBorders,
  getGridCellElementBordersChange,
  getGridCellElementBordersChanges,
  getGridCellElementBordersSquare,
  getPebGridElementBorderOptions,
  getPebGridElementBorderOptionsChanges,
  PebGridElementBorder,
  PebGridElementBorderOption,
} from './grid-utils';

describe('Utils:Grid', () => {

  it('should get grid element border options changes', () => {

    let borderOptions = {
      [PebGridElementBorder.Right]: true,
      [PebGridElementBorder.Top]: true,
      [PebGridElementBorder.Left]: true,
      [PebGridElementBorder.Bottom]: true,
      [PebGridElementBorder.InnerHorizontal]: true,
      [PebGridElementBorder.InnerVertical]: true,
    };

    /**
     * argument borderOption is null
     */
    let result = getPebGridElementBorderOptionsChanges(borderOptions, null);
    expect(result).toEqual({});

    /**
     * argument borderOption is 'test'
     */
    result = getPebGridElementBorderOptionsChanges(borderOptions, 'test' as any);
    expect(result).toEqual(borderOptions);

    /**
     * argument borderOption is PebGridElementBorderOption.OuterAll
     */
    result = getPebGridElementBorderOptionsChanges(borderOptions, PebGridElementBorderOption.OuterAll);
    expect(result).toEqual({
      [PebGridElementBorder.Right]: true,
      [PebGridElementBorder.Top]: true,
      [PebGridElementBorder.Left]: true,
      [PebGridElementBorder.Bottom]: true,
      [PebGridElementBorder.InnerHorizontal]: true,
      [PebGridElementBorder.InnerVertical]: true,
    });

    /**
     * argument borderOption is PebGridElementBorderOption.All
     */
    result = getPebGridElementBorderOptionsChanges(borderOptions, PebGridElementBorderOption.All);
    expect(result).toEqual({
      [PebGridElementBorder.Right]: false,
      [PebGridElementBorder.Top]: false,
      [PebGridElementBorder.Left]: false,
      [PebGridElementBorder.Bottom]: false,
      [PebGridElementBorder.InnerHorizontal]: false,
      [PebGridElementBorder.InnerVertical]: false,
    });

    /**
     * argument borderOptions is as NONE
     */
    borderOptions = {
      [PebGridElementBorder.Right]: false,
      [PebGridElementBorder.Top]: false,
      [PebGridElementBorder.Left]: false,
      [PebGridElementBorder.Bottom]: false,
      [PebGridElementBorder.InnerHorizontal]: false,
      [PebGridElementBorder.InnerVertical]: false,
    };
    result = getPebGridElementBorderOptionsChanges(borderOptions, PebGridElementBorderOption.All);
    expect(result).toEqual({
      [PebGridElementBorder.Right]: true,
      [PebGridElementBorder.Top]: true,
      [PebGridElementBorder.Left]: true,
      [PebGridElementBorder.Bottom]: true,
      [PebGridElementBorder.InnerHorizontal]: true,
      [PebGridElementBorder.InnerVertical]: true,
    });

  });

  it('should get grid element border options', () => {

    /**
     * argument options is PebGridElementBorderOption.OuterAll
     */
    expect(getPebGridElementBorderOptions(PebGridElementBorderOption.OuterAll)).toEqual({
      [PebGridElementBorder.Right]: true,
      [PebGridElementBorder.Top]: true,
      [PebGridElementBorder.Left]: true,
      [PebGridElementBorder.Bottom]: true,
      [PebGridElementBorder.InnerHorizontal]: false,
      [PebGridElementBorder.InnerVertical]: false,
    });

    /**
     * argument options is null
     */
    expect(getPebGridElementBorderOptions(null)).toEqual({
      [PebGridElementBorder.Right]: false,
      [PebGridElementBorder.Top]: false,
      [PebGridElementBorder.Left]: false,
      [PebGridElementBorder.Bottom]: false,
      [PebGridElementBorder.InnerHorizontal]: false,
      [PebGridElementBorder.InnerVertical]: false,
    });

  });

  it('should get grid cell element borders', () => {

    let gridElementBorders = {
      top: false,
      right: false,
      bottom: false,
      left: false,
      'inner-horizontal': false,
      'inner-vertical': false,
    };
    const index = 2;
    const colRowCount = {
      colCount: 2,
      rowCount: 2,
    };
    const borderValue = {
      style: 'solid',
      width: 1,
      color: '#333333',
    };

    // w/o borders
    let result = getGridCellElementBorders(gridElementBorders, index, colRowCount, borderValue);

    expect(result).toEqual({
      top: null,
      right: null,
      bottom: null,
      left: null,
    });

    // w/ borders
    gridElementBorders = {
      top: true,
      right: true,
      bottom: true,
      left: true,
      'inner-horizontal': true,
      'inner-vertical': true,
    };

    result = getGridCellElementBorders(gridElementBorders, index, colRowCount, borderValue);

    expect(result).toEqual({
      top: null,
      right: borderValue,
      bottom: borderValue,
      left: borderValue,
    });

    //
    colRowCount.colCount = 3;

    result = getGridCellElementBorders(gridElementBorders, index, colRowCount, borderValue);

    expect(result).toEqual({
      top: borderValue,
      right: borderValue,
      bottom: borderValue,
      left: null,
    });

  });

  it('should create grid cell element border styles', () => {

    const value = {
      style: 'solid',
      width: 1,
      color: '#333333',
    };
    const borders = {
      top: value,
      right: value,
      bottom: value,
      left: value,
    };

    // w/o borders
    let result = createGridCellElementBorderStyles({});

    expect(result).toEqual({});

    // w/ null borders
    result = createGridCellElementBorderStyles({
      top: null,
      right: null,
      bottom: null,
      left: null,
    });

    expect(result).toEqual({});

    // w/ borders
    result = createGridCellElementBorderStyles(borders);

    expect(result).toEqual({
      borderTopColor: value.color,
      borderTopStyle: value.style,
      borderTopWidth: value.width,
      borderBottomColor: value.color,
      borderBottomStyle: value.style,
      borderBottomWidth: value.width,
      borderLeftColor: value.color,
      borderLeftStyle: value.style,
      borderLeftWidth: value.width,
      borderRightColor: value.color,
      borderRightStyle: value.style,
      borderRightWidth: value.width,
    });

  });

  it('should handle grid cell element borders change', () => {

    const value = {
      style: 'solid',
      width: 1,
      color: '#333333',
    };
    let cellElementBorders = {
      top: value,
      right: value,
      bottom: value,
      left: value,
    };
    const index = 2;
    let colCount = 2;

    // row != 1
    // col = 1
    let result = getGridCellElementBordersChange(cellElementBorders, index, colCount);

    expect(result).toEqual({
      0: { bottom: value },
      2: {
        right: value,
        bottom: value,
        left: value,
      },
    } as any);

    // row = 1
    // col != 1
    colCount = 3;

    result = getGridCellElementBordersChange(cellElementBorders, index, colCount);

    expect(result).toEqual({
      1: { right: value },
      2: {
        top: value,
        right: value,
        bottom: value,
      },
    } as any);

    // cellElementBorder.right, bottom & left are null
    cellElementBorders = {
      top: value,
      right: null,
      bottom: null,
      left: null,
    };

    result = getGridCellElementBordersChange(cellElementBorders, index, colCount);

    expect(result).toEqual({ 2: { top: value } } as any);

    /**
     * cellElementBorder.top is also null
     */
    cellElementBorders.top = null;

    result = getGridCellElementBordersChange(cellElementBorders, index, colCount);

    expect({ 2: {} } as any);

  });

  it('should get grid cell element borders square', () => {

    let borderOption = PebGridElementBorderOption.All;
    const borderStyle = {
      style: 'solid',
      color: '#333333',
      width: 2,
    };
    const colCount = 3;
    const limits = {
      minCol: 1,
      maxCol: 3,
      minRow: 1,
      maxRow: 2,
    };
    const expectedForAll = {
      top: borderStyle,
      right: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
    };

    // borderOption = all
    let result = getGridCellElementBordersSquare({
      borderOption,
      borderStyle,
      colCount,
      minCol: limits.minCol,
      minRow: limits.minRow,
      maxCol: limits.maxCol,
      maxRow: limits.maxRow,
    });

    expect(result).toEqual({
      4: expectedForAll,
      5: expectedForAll,
      6: expectedForAll,
      7: expectedForAll,
      8: expectedForAll,
      9: expectedForAll,
    });

    // borderOption = none
    borderOption = PebGridElementBorderOption.None;

    result = getGridCellElementBordersSquare({
      borderOption,
      borderStyle,
      colCount,
      minCol: limits.minCol,
      minRow: limits.minRow,
      maxCol: limits.maxCol,
      maxRow: limits.maxRow,
    });

    expect(result).toEqual({
      4: {},
      5: {},
      6: {},
      7: {},
      8: {},
      9: {},
    });

  });

  it('should get grid cell element borders changes', () => {

    const value = {
      style: 'solid',
      width: 1,
      color: '#333333',
    };
    let cellElementBorders = {
      top: value,
      right: value,
      bottom: value,
      left: value,
    };
    const index = 2;
    let colCount = 2;

    // row != 1
    // col = 1
    let result = getGridCellElementBordersChanges({ cellElementBorders, index, colCount });

    expect(result).toEqual({
      0: { bottom: value },
      2: {
        right: value,
        bottom: value,
        left: value,
      },
    });

    // row = 1
    // col != 1
    colCount = 3;

    result = getGridCellElementBordersChanges({ cellElementBorders, index, colCount });

    expect(result).toEqual({
      1: { right: value },
      2: {
        top: value,
        right: value,
        bottom: value,
      },
    });

    // all props in cellElementBorder are null
    cellElementBorders = {
      top: null,
      right: null,
      bottom: null,
      left: null,
    };

    result = getGridCellElementBordersChanges({ cellElementBorders, index, colCount });

    expect(result).toEqual({ 2: {} });

  });

});
