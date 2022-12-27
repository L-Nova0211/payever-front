import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select } from '@ngxs/store';
import { merge, Observable, Subject } from 'rxjs';
import { filter, map,  skip,  take, tap } from 'rxjs/operators';

import { PebElementDef, PebScreen } from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';

@Injectable({ providedIn: 'any' })
export class PebShapeOpacityService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$: Observable<PebScreen>;

  public submitForm$: Subject<boolean> = new Subject();
  public shapeOpacityForm = this.formBuilder.group({ opacity: 1 });

  private id: string;

  private changeForm$ = this.shapeOpacityForm.valueChanges
  .pipe(
    skip(1),
    tap((shapeOpacity) =>{
      shapeOpacity['opacity'] = shapeOpacity['opacity'] / 100;
      this.updateLocalElement(shapeOpacity);
    }),
  );

  private watchSubmitForm$ = this.submitForm$.asObservable().pipe(
    tap(() => {
      const opacity = this.shapeOpacityForm.get('opacity').value/100;
      this.saveElement({ opacity });
    }),
  );

  private selectedElement$ = this.selectedElements$.pipe(
    filter((elements) => {
      return !!elements[0]?.id;
    }),
    map((elements) => {
      const { id } = elements[0];
      this.id = id;

      return this.pebRTree.find(id);
    }),
    tap((element) => {
      const notUndefinedOpacity = element.styles.opacity !== undefined;
      this.shapeOpacityForm.patchValue(
        { opacity:  notUndefinedOpacity ? element.styles.opacity * 100 : 100 },
        { emitEvent: true },
      );
    }),
  );

  public initService$ = merge(this.changeForm$, this.selectedElement$, this.watchSubmitForm$);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly editorStore: PebEditorStore,
    private readonly pebRTree: PebRTree<PebAbstractElement>,
  ) { }

  private saveElement(styles) {
    this.screen$.pipe(
      tap((screen: PebScreen) => {
        this.editorStore.updateStyles(screen, {
          [this.id]: styles,
        });
      }),
      take(1),
    ).subscribe();
  }

  private updateLocalElement(styles): void {
    const id = this.id;
    const element = this.pebRTree.find(id);
    element.styles.opacity = styles.opacity;
  }

}
