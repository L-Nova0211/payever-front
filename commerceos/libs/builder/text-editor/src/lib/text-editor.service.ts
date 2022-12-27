import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import {
  PebAbstractTextEditorService,
  PebElementType,
  PebScreen,
  pebScreenContentWidthList,
  pebScreenDocumentWidthList,
  PebTextJustify,
} from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';

import { PebTextSelectionStyles, PebTextStyles, TextEditorCommand } from './text-editor.interface';
import { Select } from '@ngxs/store';

/**
 * Public API:
 *
 * dispatch(cmd: TextEditorCommand, value: any)
 *
 * styles$: Observable<PebTextEditorStyles> - styles of current selection
 */
@Injectable()
export class PebTextEditorService implements PebAbstractTextEditorService {

  private readonly dimensionsSubject$ = new Subject<{ width: number; height: number; }>();
  private readonly contentSubject$ = new Subject<string>();

  private readonly undoStackSubject$ = new BehaviorSubject([]);
  private readonly redoStackSubject$ = new BehaviorSubject([]);
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  readonly canUndo$ = this.undoStackSubject$.pipe(
    map(stack => !!stack.length),
  );

  readonly canRedo$ = this.redoStackSubject$.pipe(
    map(stack => !!stack.length),
  );

  readonly selectedElement$ = new ReplaySubject<any>(1);
  readonly cursorPosition$ = new Subject<{ x: number, y: number }>();
  readonly execCommand$ = new Subject<[TextEditorCommand, any]>();
  readonly selection$ = new Subject<{ index: number; length: number; }>();
  readonly styles$ = new ReplaySubject<Partial<PebTextSelectionStyles>>(1);
  readonly dimensions$ = this.selectedElement$.pipe(switchMap(() => this.dimensionsSubject$));
  readonly content$ = this.selectedElement$.pipe(switchMap(() => this.contentSubject$));
  readonly limits$ = this.selectedElement$.pipe(
    withLatestFrom(this.screen$),
    switchMap(([elmCmp, screen]) => this.dimensions$.pipe(
      map(() => {
        const dimensions = this.getMakerMaxPossibleDimensions(elmCmp, screen);
        const { height } = dimensions;
        let { width } = dimensions;
        const { maxWidth } = elmCmp.styles;
        if (maxWidth) {
          width = typeof maxWidth === 'string' ? parseFloat(maxWidth) : maxWidth;
        }

        let horizontalPadding: number;
        let verticalPadding: number;
        const { padding } = elmCmp.styles;
        if (padding) {
          const values = padding.split(' ').map(value => parseInt(value, 10));
          switch (values.length) {
            case 1:
              horizontalPadding = values[0] * 2;
              verticalPadding = values[0] * 2;
              break;
            case 2:
              horizontalPadding = values[1] * 2;
              verticalPadding = values[0] * 2;
              break;
            case 4:
              horizontalPadding = values[1] + values[3];
              verticalPadding = values[0] + values[2];
              break;
          }
        } else {
          const { paddingLeft, paddingTop, paddingRight, paddingBottom } = elmCmp.styles;
          horizontalPadding = toNumber(paddingLeft) + toNumber(paddingRight);
          verticalPadding = toNumber(paddingTop) + toNumber(paddingBottom);
        }

        return {
          width: width - horizontalPadding,
          height: height - verticalPadding,
        };
      })),
    ),
  );

  constructor(private tree: PebRTree<PebAbstractElement>) {}

  selectElement(value: any): void {
    this.selectedElement$.next(value);
  }

  setContent(value: string): void {
    this.contentSubject$.next(value);
  }

  setCursorPosition(value: { x: number, y: number }): void {
    this.cursorPosition$.next(value);
  }

  setSelection(value: { index: number; length: number; }): void {
    this.selection$.next(value);
  }

  setDimensions(value: { width: number; height: number }): void {
    this.dimensionsSubject$.next(value);
  }

  setStyles(value: PebTextSelectionStyles): void {
    this.styles$.next(value);
  }

  setUndoStack(stack): void {
    this.undoStackSubject$.next(stack);
  }

  setRedoStack(stack): void {
    this.redoStackSubject$.next(stack);
  }

  dispatch<T extends TextEditorCommand>(cmd: T, payload?: any) {
    this.execCommand$.next([cmd, payload]);
  }

  applyStyles(styles: Partial<PebTextStyles>): void {
    Object.entries(styles).forEach(([key, value]) => {
      switch (key) {
        case 'link':
          this.dispatch(TextEditorCommand.link, value);
          break;
        case 'fontFamily':
          this.dispatch(TextEditorCommand.fontFamily, value);
          break;
        case 'color':
          this.dispatch(TextEditorCommand.color, value);
          break;
        case 'fontWeight':
          this.dispatch(TextEditorCommand.fontWeight, value);
          break;
        case 'italic':
          this.dispatch(TextEditorCommand.italic, value);
          break;
        case 'underline':
          this.dispatch(TextEditorCommand.underline, value);
          break;
        case 'strike':
          this.dispatch(TextEditorCommand.strike, value);
          break;
        case 'fontSize':
          this.dispatch(TextEditorCommand.fontSize, value);
          break;
        case 'textJustify':
          this.dispatch(TextEditorCommand.justify, value === PebTextJustify.Left ? false : value);
          break;
      }
    });
  }

  getMakerMaxPossibleDimensions(elCmp, screen: PebScreen): { width: number; height: number; } {
    const abstractElement = this.tree.find(elCmp.definition.id);
    const abstractParentElement = this.tree.find(elCmp.parent.definition.id);

    const elementBBox = this.tree.toBBox(abstractElement);
    const parentBBox = this.tree.toBBox(abstractParentElement);

    const toRight = this.tree.search({
      minX: elementBBox.maxX + 1,
      minY: elementBBox.minY,
      maxX: parentBBox.maxX - 1,
      maxY: elementBBox.maxY,
    }).map(element => this.tree.toBBox(element))
      .filter(value => value.minX >= elementBBox.maxX)
      .map(value => value.minX);

    let width;
    if (toRight.length > 0) {
      width = Math.min(...toRight) - elementBBox.minX;
    } else {
      width =  parentBBox.maxX - elementBBox.minX;
      if (abstractParentElement.element.type === PebElementType.Section) {
        width = parentBBox.maxX - (pebScreenDocumentWidthList[screen] - pebScreenContentWidthList[screen]);
      }
    }

    const toBottom = this.tree.search({
      minX: elementBBox.minX,
      minY: elementBBox.maxY + 1,
      maxX: elementBBox.maxX,
      maxY: parentBBox.maxY - 1,
    }).map(element => this.tree.toBBox(element))
      .filter(value => value.minY >= elementBBox.maxY)
      .map(value => value.minY);

    const height = (toBottom.length > 0 ? Math.min(...toBottom) : parentBBox.maxY) - elementBBox.minY;

    return { width, height };
  }
}

export function toNumber(value: string | number = 0): number {
  return typeof value === 'string' ? parseInt(value, 10) : value;
}
