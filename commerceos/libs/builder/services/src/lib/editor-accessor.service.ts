import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { PebRenderer } from '@pe/builder-renderer';


/**
 * This service is needed for provide access to the same instance of PebEditor component
 * that rendered in root editor component.
 * @deprecated
 */
@Injectable({ providedIn: 'root' })
export class PebEditorAccessorService implements OnDestroy {

  private readonly destroyedSubject$ = new Subject<void>();
  readonly destroyed$ = this.destroyedSubject$.asObservable();

  private readonly editorSubject$ = new BehaviorSubject<any>(null);
  private readonly iframeSubject$ = new BehaviorSubject<HTMLIFrameElement>(undefined);

  set editorComponent(val) {
    this.editorSubject$.next(val);
  }

  get editorComponent() {
    return this.editorSubject$.value;
  }

  readonly rendererSubject$ = new BehaviorSubject<PebRenderer>(null);

  set renderer(val: PebRenderer) {
    this.rendererSubject$.next(val);
  }

  get renderer() {
    return this.rendererSubject$.value;
  }

  set iframe(value) {
    this.iframeSubject$.next(value);
  }

  get iframe() {
    return this.iframeSubject$.value;
  }

  ngOnDestroy() {
    this.destroyedSubject$.next();
  }
}
