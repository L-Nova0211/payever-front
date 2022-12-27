import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  NgZone,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { EnvService } from '@pe/common';
import { PopupMode } from '@pe/shared/contacts';

import { ContactsDialogService } from '../../../../services/contacts-dialog.service';
import { InvoiceEnvService } from '../../../../services/invoice-env.service';

@Component({
  selector: 'pe-browse-contacts',
  templateUrl: './browse-contacts.component.html',
  styleUrls: ['./browse-contacts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeBrowseContactsFormComponent implements AfterViewInit {
  theme: string;
  @ViewChild(TemplateRef) ref;
  private dialogRef: any;

  constructor(
    @Inject(EnvService) private envService: InvoiceEnvService,
    public dialog: MatDialog,
    private router: Router,
    private store: Store,
    private contactDialogService: ContactsDialogService,
    private zone: NgZone,
  ) {}

  ngAfterViewInit() {
    this.store.dispatch(new PopupMode(true));
    this.zone.run(() => {this.dialogRef = this.dialog.open(this.ref, {})});
    this.dialogRef.afterClosed().subscribe((isSave: any) => {
      this.store.dispatch(new PopupMode(false));
      this.contactDialogService.changeSaveStatus(isSave);
      this.close();
    });
  }

  closeContactDialog(): any {
    this.dialogRef.close(false);
  }

  addContactDialog(): any {
    this.dialogRef.close(true);
  }

  close() {
    this.router.navigate([`/business/${this.envService.businessId}/invoice`] );
  }
}
