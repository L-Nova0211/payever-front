import { ChangeDetectionStrategy, Component, ComponentRef, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

import { PebScreen } from '@pe/builder-core';
import { PebRenderer } from '@pe/builder-renderer';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-client-page-overlay',
  templateUrl: './page-overlay.component.html',
  styleUrls: ['./page-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebClientPageOverlayComponent {

  @Input() snapshot: any;
  @Input() screen$: Observable<PebScreen>;
  @Input() scale$: Observable<number>;
  @Input() language$: Observable<string>;
  @Input() defaultLanguage: string;
  @Input() componentRef: ComponentRef<PebClientPageOverlayComponent>;

  @ViewChild(PebRenderer) renderer: PebRenderer;

  readonly destroyed$ = this.destroy$.asObservable();

  onInteraction: (e, cmp?) => void = () => {};

  constructor(private readonly destroy$: PeDestroyService) {}

  buildOutAnimation(): Observable<void> {
    return this.renderer?.applyBuildOutAnimation();
  }

  render(): void {
    this.renderer?.renderDocument();
  }

}
