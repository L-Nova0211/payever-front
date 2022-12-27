import { Injectable } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Select } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebElementDef, PebScreen } from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';

import { EditorBorderStyleForm } from '../border-style/border-style.form';
import { PebColorForm } from '../color/color.form';


@Injectable({ providedIn: 'any' })
export class PebShapeBorderService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$: Observable<PebScreen>;

  public shapeBorderForm = this.formBuilder.group(
    {
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'inherit',
    },
    { updateOn: 'blur' },
  );

  private selectedElements: PebAbstractElement[];

  private changeForm$ = this.shapeBorderForm.valueChanges
  .pipe(
    filter(() => this.shapeBorderForm.dirty),
    tap((shapeBorder) => {
      this.shapeBorderForm.markAsPristine();
      shapeBorder['borderWidth'] = +shapeBorder['borderWidth'];
      this.saveElement(shapeBorder);
      this.updateLocalElement(shapeBorder);
    }),
  );

  private selectedElement$ = this.selectedElements$.pipe(
    map((elements) => {

      this.selectedElements = elements.map((element) => {
        const { id } = element;

        return this.pebRTree.find(id);
      });

      const checkedStyles = [
        { key: 'borderWidth', default: 0 },
        { key: 'borderStyle', default: 'solid' },
        { key: 'borderColor', default: 'inherit' },
      ];

      const styles = checkedStyles.map((checkedStyles) => {
        const value = this.selectedElements.reduce((acc: any, element) => {
          const style = element.styles[checkedStyles.key];

          return acc.includes(style) ? acc : [...acc, style];
        }, []);

        return {
          key: checkedStyles.key,
          value: value.length === 1 && !!value[0] ? value[0] : checkedStyles.default,
        };
      });

      const updateValue = styles.reduce((acc, style) => {
        acc[style.key] = style.value;

        return acc;
      }, {});

      this.shapeBorderForm.patchValue(updateValue, { emitEvent: true });

    }),
  )

  public initService$ = merge(this.changeForm$, this.selectedElement$);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly editorStore: PebEditorStore,
    private readonly pebRTree: PebRTree<PebAbstractElement>,
    private readonly  editorAccessorService: PebEditorAccessorService,
  ) {}

  openBorderStyleForm() {
    const editor = this.editorAccessorService.editorComponent;
    editor.detail = { back: 'Back', title: 'Border style' };
    const sidebarCmpRef = editor.insertToSlot(EditorBorderStyleForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formControl = this.shapeBorderForm.get('borderStyle') as FormControl;
    sidebarCmpRef.instance.blurred.pipe(
      tap(() => {
        const styles = this.shapeBorderForm.getRawValue();
        this.saveElement(styles);
        this.updateLocalElement(styles);
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }

  showBorderColorForm() {
    const editor = this.editorAccessorService.editorComponent;
    editor.detail = { back: 'Style', title: 'Border Color' };
    const sidebarCmpRef = editor.insertToSlot(PebColorForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formControl = this.shapeBorderForm.get('borderColor') as FormControl;
  }

  private saveElement(styles) {
    const stylesObj = {};
    this.selectedElements.forEach((abstractElement) => {
      stylesObj[abstractElement.element.id] = styles;
    });

    this.screen$.pipe(
      tap((screen: PebScreen) => {
        this.editorStore.updateStyles(screen, stylesObj);
      }),
      take(1),
    ).subscribe();
  }

  private updateLocalElement(styles): void {
    this.selectedElements.forEach((element) => {
      element.styles.borderColor = styles.borderColor;
      element.styles.borderStyle = styles.borderStyle;
      element.styles.borderWidth = styles.borderWidth;
    });
  }

}
