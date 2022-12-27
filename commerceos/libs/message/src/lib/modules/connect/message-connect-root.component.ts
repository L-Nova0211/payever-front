import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { ContactsState, PeDestroyService } from '@pe/common';

@Component({
  selector: 'pe-message-connect-component',
  templateUrl: './message-connect-root.component.html',
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageConnectRootComponent implements AfterViewInit {
  @SelectSnapshot(ContactsState.contacts) contactsSnapshot: any;

  private dialogRef: MatDialogRef<any>;
  theme = 'dark';

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
  ) {}

  ngAfterViewInit(): void {
    this.openContactsOverlay();
  }

  private openContactsOverlay(): void {
    this.dialogRef = this.matDialog.open(this.templateRef, {
      backdropClass: 'message-connect-backdrop',
      hasBackdrop: true,
      width: '90vw',
      height: '90vh',
      panelClass: 'message-connect',
      data: {
        theme: this.theme,
      },
    });
  }

  backDialog(): void {
    this.router.navigate(['../connect'], { relativeTo: this.route.parent });
    this.dialogRef.close(true);
  }

  closeDialog(): void {
    this.router.navigate(['../'], { relativeTo: this.route.parent });
    this.dialogRef.close(false);
  }
}
