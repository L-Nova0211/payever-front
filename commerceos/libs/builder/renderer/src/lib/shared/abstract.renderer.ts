import { Observable } from 'rxjs';

export interface PebAbstractRenderer {
  readonly rendered: Observable<any>;
  readonly nativeElement: HTMLElement;
}
