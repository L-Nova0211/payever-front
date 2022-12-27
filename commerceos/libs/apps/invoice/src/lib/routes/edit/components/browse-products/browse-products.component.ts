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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { EnvService } from '@pe/common';
import { PopupMode } from '@pe/shared/products';

import { InvoiceEnvService } from '../../../../services/invoice-env.service';
import { ProductsDialogService } from '../../../../services/products-dialog.service';

@Component({
  selector: 'pe-browse-products',
  templateUrl: './browse-products.component.html',
  styleUrls: ['./browse-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeBrowseProductsFormComponent implements AfterViewInit {
  theme: string;
  @ViewChild(TemplateRef) ref;
   private dialogRef: MatDialogRef<PeBrowseProductsFormComponent>;

  constructor(
    @Inject(EnvService) private envService: InvoiceEnvService,
    public dialog: MatDialog,
    private router: Router,
    private store: Store,
    private productDialogService: ProductsDialogService,
    private zone: NgZone
  ) {}

  ngAfterViewInit() {
    this.store.dispatch(new PopupMode(true));
    this.zone.run(() => {this.dialogRef = this.dialog.open(this.ref, { panelClass: 'product-add-overlay' })});
    this.dialogRef.afterClosed().subscribe((isSave: any) => {
      this.store.dispatch(new PopupMode(false));
      this.productDialogService.changeSaveStatus(isSave);
      this.close();
    });
  }

  closeProductDialog(): any {
     this.dialogRef.close(false);
  }

  addProductDialog(): any {
     this.dialogRef.close(true);
  }

  close() {
    this.router.navigate([`/business/${this.envService.businessId}/invoice`] );
  }
}
