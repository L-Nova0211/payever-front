import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { merge as lMerge } from 'lodash';
import { combineLatest, merge, Observable, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  retry,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  createGridCellElementBorderStyles,
  getGridCellElementBordersChange,
  getGridCellElementBordersChanges,
  getGridCellElementBordersSquare,
  getPebGridElementBorderOptions,
  getPebGridElementBorderOptionsChanges,
  PebAction,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebGridCellElementBorder,
  PebGridCellElementBorders,
  PebGridElementBorder,
  PebGridElementBorderOption,
  PebGridElementBorders,
  PebTemplateEffect,
} from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';
import { PebColorForm } from '../color/color.form';


@Component({
  selector: 'peb-grid-border-form',
  templateUrl: './grid-border.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './grid-border.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebGridBorderForm implements OnInit {

  @Select(PebElementSelectionState.elements) readonly selectedElements$: Observable<PebElementDef[]>;
  readonly options: PebGridElementBorderOption[] = Object.values(PebGridElementBorderOption)
    .filter(option => option !== PebGridElementBorderOption.None);

  readonly selectedGridElements$: Observable<{
    gridElement: PebElementDef,
    cells: Array<{
      id: string,
      element: PebElementDef,
      index: number,
      row: number,
      col: number,
    }>,
  }>;

  readonly formGroup: FormGroup = this.fb.group({
    color: ['#000000'],
    width: [1],
    options: this.fb.group(this.options.reduce((acc, option) => {
      acc[option] = [false];

      return acc;
    }, {})),
  });

  readonly borderColor$: Observable<{ backgroundColor: string }>;

  constructor(
    private editorAccessorService: PebEditorAccessorService,
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
    private editorRenderer: PebEditorRenderer,
    private editorStore: PebEditorStore,
    private cdr: ChangeDetectorRef,
  ) {
    this.selectedGridElements$ = combineLatest([
      this.selectedElements$,
      this.editorRenderer.rendered.pipe(startWith(null)),
    ]).pipe(
      debounceTime(10),
      filter(([elements]) => elements.every(el => editorRenderer.getElement(el.id))),
      map(([elements]) => {
        if (elements.length) {
          if (elements.length === 1 && elements[0].type === PebElementType.Grid) {
            return { gridElement: editorRenderer.getElement(elements[0].id), cells: [] };
          }

          if (elements.every(el => el.parent?.type === PebElementType.Grid)) {
            const gridElement = editorRenderer.getElement(elements[0].parent.id);
            const { colCount = 1 } = gridElement.data;
            const cellsDict = gridElement.children.reduce((acc, child, index) => {
              const row = Math.floor(index / colCount);
              const col = index - row * colCount;
              acc[child.id] = {
                index, col, row,
                id: child.id,
                element: child,
              };

              return acc;
            }, {});
            const cells = elements.map(cell => cellsDict[cell.id]);

            return {
              gridElement,
              cells,
            };
          }
        }

        return null;
      }),
    );
    this.borderColor$ = this.selectedGridElements$.pipe(
      filter(Boolean),
      switchMap(() => this.formGroup.get('color').valueChanges.pipe(
        startWith(this.formGroup.get('color').value),
      )),
      distinctUntilChanged(),
      map((value: any) => ({ backgroundColor: value })),
    );
  }

  ngOnInit() {
    merge(
      this.selectedGridElements$.pipe(
        filter(elements => !!elements),
        tap(({ gridElement, cells }) => {
          const isContextGrid = !gridElement.children.length;
          const gridData = gridElement.data;

          const { borders: elementBorders, color, width } = isContextGrid ? {
            borders: (gridData.borderOptions ?? getPebGridElementBorderOptions(PebGridElementBorderOption.None)),
            color: gridData.borderColor || '#000000',
            width: gridData.borderWidth || 1,
          } : this.getGridElementBorders(gridData, cells);

          const borderOptions = {
            [PebGridElementBorderOption.OuterRight]: elementBorders[PebGridElementBorder.Right],
            [PebGridElementBorderOption.OuterLeft]: elementBorders[PebGridElementBorder.Left],
            [PebGridElementBorderOption.OuterTop]: elementBorders[PebGridElementBorder.Top],
            [PebGridElementBorderOption.OuterBottom]: elementBorders[PebGridElementBorder.Bottom],
            [PebGridElementBorderOption.InnerHorizontal]: elementBorders[PebGridElementBorder.InnerHorizontal],
            [PebGridElementBorderOption.InnerVertical]: elementBorders[PebGridElementBorder.InnerVertical],
            [PebGridElementBorderOption.InnerAll]:
              elementBorders[PebGridElementBorder.InnerHorizontal] &&
              elementBorders[PebGridElementBorder.InnerVertical],
            [PebGridElementBorderOption.OuterAll]:
              elementBorders[PebGridElementBorder.Right] &&
              elementBorders[PebGridElementBorder.Left] &&
              elementBorders[PebGridElementBorder.Top] &&
              elementBorders[PebGridElementBorder.Bottom],
            [PebGridElementBorderOption.All]: Object.values(elementBorders).every(b => !!b),
          };

          Object.entries(borderOptions).forEach(([option, value]) => {
            const control = this.formGroup.get(`options.${option}`);
            if (control) {
              control.patchValue(value, { emitEvent: false });
            }
          });
          if (color) {
            this.formGroup.get('color').patchValue(color, { emitEvent: false });
          }
          if (width) {
            this.formGroup.get('width').patchValue(width, { emitEvent: false });
          }
          this.cdr.detectChanges();
        }),
      ),
      merge(
        ...this.options.map((option) => {
          return this.formGroup.get(`options.${option}`).valueChanges.pipe(
            withLatestFrom(this.selectedGridElements$),
            filter(([, grid]) => !!grid),
            map(([checked, { gridElement, cells }]) => {
              const color = this.formGroup.get('color').value;
              const width = this.formGroup.get('width').value;
              const gridData = gridElement.data;
              const { colCount = 0, rowCount = 0 } = gridData;
              let dataChanges;

              const square = this.getSelectionSquare(cells, colCount, rowCount);
              const bc = getGridCellElementBordersSquare({
                colCount,
                borderOption: option,
                borderStyle: checked ? {
                  width,
                  color,
                  style: 'solid',
                } : { style: 'none' },
                ...square,
              });

              const borderOptions: { [key: number]: any } = gridElement.children.reduce(
                (acc, child, index) => {
                  if (bc[index]) {
                    const changes = getGridCellElementBordersChanges({
                      index,
                      colCount,
                      cellElementBorders: bc[index],
                    });

                    return lMerge(acc, changes);
                  }

                  return acc;
                },
                {},
              );

              const borderChanges = Object.entries(borderOptions).reduce((acc, [index, child]) => {
                if (bc[index]) {
                  const changes = getGridCellElementBordersChanges({
                    colCount,
                    index: Number(index),
                    cellElementBorders: bc[index],
                  });
                  delete bc[index];

                  return lMerge(acc, changes);
                }

                return acc;
              }, {});

              dataChanges = {
                cellsBorderOptions: lMerge(
                  {},
                  gridElement.data.cellsBorderOptions,
                  Object.entries(borderChanges).reduce(
                    (acc, [i, changes]) => {
                      acc[i] = createGridCellElementBorderStyles(changes);

                      return acc;
                    },
                    {},
                  ),
                ),
              };

              if (!cells.length) {
                dataChanges = {
                  ...dataChanges,
                  borderOptions: getPebGridElementBorderOptionsChanges(gridData.borderOptions, option, checked),
                  borderColor: color,
                  borderWidth: width,
                };
              }

              return { dataChanges, gridElement };
            }),
          );
        }),
        merge(
          this.formGroup.get('color').valueChanges.pipe(
            withLatestFrom(this.selectedGridElements$),
            filter(([, grid]) => !!grid),
            map(data => [...data, 'Color']),
          ),
          this.formGroup.get('width').valueChanges.pipe(
            withLatestFrom(this.selectedGridElements$),
            filter(([, grid]) => !!grid),
            map(data => [...data, 'Width']),
          ),
        ).pipe(
          map(([value, { gridElement, cells }, prop]) => {
            let dataChanges;

            if (!cells.length) {
              dataChanges = {
                [`border${prop}`]: value,
              };
            }

            const cellBorderOptions = gridElement.data?.cellsBorderOptions ? {
              ...gridElement.data?.cellsBorderOptions,
            } : {};
            const change = {
              [prop.toLowerCase()]: value,
            };
            const { colCount = 1 } = gridElement.data;
            const cellChangeHandler = (cellIndex) => {
              const cellChanges = getGridCellElementBordersChange(
                Object.values(PebGridCellElementBorder).reduce((cbAcc, cb) => ({
                  ...cbAcc, [cb]: change,
                }), {}) as PebGridCellElementBorders,
                cellIndex,
                colCount,
              );

              Object.entries(cellChanges).forEach(([index, cellChange]) => {
                if (cellBorderOptions[index]) {
                  cellBorderOptions[index] = lMerge(
                    {},
                    cellBorderOptions[index],
                    { ...createGridCellElementBorderStyles(cellChange) },
                  );
                }
              });
            };
            if (cells.length) {
              cells.forEach(cell => cellChangeHandler(cell.index));
            } else {
              const borderOptions = gridElement.data?.cellsBorderOptions
                && Object.values(gridElement.data?.cellsBorderOptions).length
                  ? Object.values(gridElement.data.cellsBorderOptions).filter(Boolean)
                  : [];

              borderOptions.forEach((child, index) => cellChangeHandler(index));
            }

            dataChanges = {
              ...dataChanges,
              cellsBorderOptions: cellBorderOptions,
            };

            return { dataChanges, gridElement };
          }),
        ),
      ).pipe(
        switchMap(({ dataChanges, gridElement }) => {
          const page = this.editorStore.page;

          const action = this.createAction([
            {
              type: PebTemplateEffect.UpdateElement,
              target: `${PebEffectTarget.Templates}:${page.templateId}`,
              payload: {
                ...gridElement,
                data: {
                  ...gridElement.data,
                  ...dataChanges,
                },
              },
            },
          ]);

          return this.editorStore.commitAction(action);
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        console.error(err);

        return throwError(err);
      }),
      retry(),
    ).subscribe();
  }



  private createAction(effects: PebEffect[]): PebAction {
    const page = this.editorStore.page;

    return {
      effects,
      id: pebGenerateId('action'),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      createdAt: new Date(),
    };
  }

  private getSelectionSquare(
    cells: Array<{ col: number, row: number }>,
    colCount,
    rowCount: number
  ): { minCol, maxCol, minRow, maxRow: number } {
    if (cells.length) {
      return cells.reduce(
        (acc, cell) => {
          if (cell.col > acc.maxCol) {
            acc.maxCol = cell.col;
          }
          if (cell.col < acc.minCol) {
            acc.minCol = cell.col;
          }
          if (cell.row < acc.minRow) {
            acc.minRow = cell.row;
          }
          if (cell.row > acc.maxRow) {
            acc.maxRow = cell.row;
          }

          return acc;
        },
        {
          minCol: cells[0].col,
          maxCol: cells[0].col,
          minRow: cells[0].row,
          maxRow: cells[0].row,
        },
      );
    }

    return { minCol: 0, maxCol: colCount - 1, minRow: 0, maxRow: rowCount - 1 };
  }

  private getGridElementBorders(gridData, cells): { borders: PebGridElementBorders, color: string, width: number } {
    const { colCount = 0, cellsBorderOptions = [], rowCount = 0 } = gridData;
    const { minCol, maxCol, minRow, maxRow } = this.getSelectionSquare(cells, colCount, rowCount);
    const optionsValue = Object.values(PebGridElementBorder).reduce((acc, o) => {
      acc[o] = true;

      return acc;
    }, {}) as PebGridElementBorders;
    const getIndex = (i, j) => {
      if (i < 0 || j < 0) {
        return -1;
      }

      return i * colCount + j;
    };

    let color = null;
    let width = null;

    for (let i = minRow; i <= maxRow; i += 1) {
      for (let j = minCol; j <= maxCol; j += 1) {
        const cellBorders = Object.values(PebGridCellElementBorder).reduce((acc, c) => {
          acc[c] = false;

          return acc;
        }, {});

        const topCellOptions = cellsBorderOptions[getIndex(i - 1, j)];
        const cellOptions = cellsBorderOptions[getIndex(i, j)];
        const leftCellOptions = cellsBorderOptions[getIndex(i, j - 1)];
        cellBorders[PebGridCellElementBorder.Top] =
          (topCellOptions ?
            !!topCellOptions?.borderBottomWidth && topCellOptions?.borderBottomStyle !== 'none' :
            !!cellOptions?.borderTopWidth && cellOptions?.borderTopStyle !== 'none') ?? false;
        cellBorders[PebGridCellElementBorder.Left] =
          (leftCellOptions ?
            !!leftCellOptions.borderRightWidth && leftCellOptions.borderRightStyle !== 'none' :
            !!cellOptions?.borderLeftWidth && cellOptions.borderLeftStyle !== 'none') ?? false;
        cellBorders[PebGridCellElementBorder.Right] =
          (!!cellOptions?.borderRightWidth && cellOptions.borderRightStyle !== 'none') ?? false;
        cellBorders[PebGridCellElementBorder.Bottom] =
          (!!cellOptions?.borderBottomWidth && cellOptions.borderBottomStyle !== 'none') ?? false;

        if (!color || !width) {
          if (cellBorders[PebGridCellElementBorder.Top]) {
            color = topCellOptions ? topCellOptions.borderBottomColor : cellOptions.borderTopColor;
            width = topCellOptions ? topCellOptions.borderBottomWidth : cellOptions.borderTopWidth;
          } else if (cellBorders[PebGridCellElementBorder.Left]) {
            color = leftCellOptions ? leftCellOptions.borderRightColor : cellOptions.borderLeftColor;
            width = leftCellOptions ? leftCellOptions.borderRightWidth : cellOptions.borderLeftWidth;
          } else if (cellBorders[PebGridCellElementBorder.Right]) {
            color = cellOptions.borderRightColor;
            width = cellOptions.borderRightWidth;
          } else if (cellBorders[PebGridCellElementBorder.Left]) {
            color = cellOptions.borderBottomColor;
            width = cellOptions.borderBottomWidth;
          }
        }

        if (i === minRow && !cellBorders[PebGridCellElementBorder.Top]) {
          optionsValue[PebGridElementBorder.Top] = false;
        }
        if (i === maxRow && !cellBorders[PebGridCellElementBorder.Bottom]) {
          optionsValue[PebGridElementBorder.Bottom] = false;
        }
        if (j === minCol && !cellBorders[PebGridCellElementBorder.Left]) {
          optionsValue[PebGridElementBorder.Left] = false;
        }
        if (j === maxCol && !cellBorders[PebGridCellElementBorder.Right]) {
          optionsValue[PebGridElementBorder.Right] = false;
        }

        if (maxRow === minRow || (i !== maxRow && !cellBorders[PebGridCellElementBorder.Bottom])) {
          optionsValue[PebGridElementBorderOption.InnerHorizontal] = false;
        }

        if (maxCol === minCol || (j !== maxCol && !cellBorders[PebGridCellElementBorder.Right])) {
          optionsValue[PebGridElementBorderOption.InnerVertical] = false;
        }
      }
    }

    return { color, width, borders: optionsValue };
  }

  showBorderColorForm() {
    const editor = this.editorAccessorService.editorComponent;
    editor.detail = { back: 'Style', title: 'Border Color' };
    const sidebarCmpRef = editor.insertToSlot(PebColorForm, PebEditorSlot.sidebarDetail);
    const value = this.formGroup.get('color').value;
    const control = new FormControl(value);

    sidebarCmpRef.instance.formControl = control;
    sidebarCmpRef.instance.blurred.pipe(
      tap(() => {
        this.formGroup.get('color').patchValue(control.value);
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }
}
