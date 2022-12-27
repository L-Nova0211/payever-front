import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { MessageBus, EnvService } from '@pe/common';
import { PopupMode } from '@pe/shared/products';

import { ProductsDialogService } from './products-dialog.service';

@Component({
  selector: 'pe-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],

  encapsulation: ViewEncapsulation.None,
})
export class PeProductsComponent implements AfterViewInit, OnDestroy {
  theme: string;
  @ViewChild(TemplateRef) ref;
  private dialogRef: any;

  constructor(
    private envService: EnvService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private productDialogService: ProductsDialogService,
    private store: Store,
    private messageBus: MessageBus,
  ) {}

  ngAfterViewInit() {
    this.store.dispatch(new PopupMode(true));
    this.dialogRef = this.dialog.open(this.ref, {});
    this.dialogRef.afterOpened().pipe(tap(() => {
      this.messageBus.emit('products.add.selectedItems', this.productDialogService.selectedProducts);
    })).subscribe()
    this.dialogRef.afterClosed().pipe(tap((isSave: any) => {
      this.store.dispatch(new PopupMode(false));
      this.productDialogService.changeSaveStatus(isSave);
      this.router.navigate([
        `../`,
      ], { relativeTo: this.route });
    })).subscribe();
  }

  closeProductDialog(): any {
    this.dialogRef.close(false);
  }

  addProductDialog(): any {
    this.dialogRef.close(true);
  }

  ngOnDestroy(): void {
    this.productDialogService.changeSaveStatus(null);
  }
}
