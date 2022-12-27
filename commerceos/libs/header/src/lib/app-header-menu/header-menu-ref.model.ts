import { OverlayRef } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';

export class PeHeaderMenuRef {
  afterClosed = new Subject<any>();

  constructor(private overlayRef: OverlayRef) {}

  close(data?: any): void {
    this.overlayRef.dispose();

    this.afterClosed.next(data);
    this.afterClosed.complete();
  }
}
