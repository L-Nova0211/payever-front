import { Injectable } from '@angular/core';
import { share } from 'rxjs/operators';

import { MessageBus } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { PeOverlayRef } from '@pe/overlay-widget';

@Injectable()
export class PeAppointmentsReferenceService {
  public appointmentEditor: PeOverlayRef;

  public readonly confirmation$ = this.messageBus.listen<boolean>('confirm').pipe(share());

  constructor(
    private confirmScreenService: ConfirmScreenService,
    private messageBus: MessageBus,
  ) { }

  public backdropClick = () => { };

  public openConfirmDialog(headings): void {
    this.confirmScreenService.show(headings, false);
  }
}
