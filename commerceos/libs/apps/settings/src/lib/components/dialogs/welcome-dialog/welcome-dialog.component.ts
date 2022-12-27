import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';

import { WelcomeDialogDataInterface } from '../../../misc/interfaces/welcome-dialog-data.interface';
import { ApiService, BackRoutingService } from '../../../services';
import { AbstractComponent } from '../../abstract';

@Component({
  selector: 'peb-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeDialogComponent extends AbstractComponent {
  showLoader = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private uids: WelcomeDialogDataInterface,
    private dialogRef: MatDialogRef<WelcomeDialogComponent>,
    private backRouting: BackRoutingService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  back() {
    this.backRouting.back(this.route);
  }

  continue() {
    if (this.showLoader) {
      return;
    }

    const { business, micro } = this.uids;
    this.showLoader = true;
    this.cdr.detectChanges();

    this.apiService.toggleInstalledApp(business, micro).pipe(
      finalize(() => {this.showLoader = false; this.cdr.detectChanges(); }),
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.dialogRef.close();
    });
  }
}
