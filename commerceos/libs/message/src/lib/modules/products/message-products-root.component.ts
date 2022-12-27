import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { EMPTY } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';

import { PeGridItem } from '@pe/grid';
import { PeMessageIntegration } from '@pe/shared/chat';
import { PopupMode, ProductsAppState } from '@pe/shared/products';

import { PeMessageApiService, PeMessageChatRoomListService, PeMessageChatRoomService } from '../../services';

@Component({
  selector: 'pe-message-products-component',
  templateUrl: './message-products-root.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageProductsRootComponent implements AfterViewInit {
  @SelectSnapshot(ProductsAppState.products) products: PeGridItem[];

  private dialogRef: MatDialogRef<any>;
  theme = 'dark';

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomService: PeMessageChatRoomService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private store: Store,
  ) {}

  ngAfterViewInit(): void {
    this.store.dispatch(new PopupMode(true));
    this.openContactsOverlay();
  }

  private openContactsOverlay(): void {
    this.dialogRef = this.matDialog.open(this.templateRef, {
      backdropClass: 'message-products-backdrop',
      hasBackdrop: true,
      width: '90vw',
      height: '90vh',
      panelClass: 'message-products',
      data: {
        theme: this.theme,
      },
    });

    this.dialogRef.afterClosed().pipe(
      filter((added) => !!added),
      switchMap(() => {
        if (this.products.length > 0) {
          const body = {
            productIds: this.products.map(product => product.id),
            type: this.peMessageChatRoomListService.activeChat?.integrationName ?? PeMessageIntegration.Internal,
          };

          return this.peMessageApiService.getProductCheckoutLink(body).pipe(
              tap((data) => {
                this.peMessageChatRoomService.sendMessage({ message: data.link });
              }),
            );
        }

        return EMPTY;
      }),
    ).subscribe();
  }

  addContactDialog(): void {
    this.router.navigate(['../'], { relativeTo: this.route.parent });
    this.dialogRef.close(true);
  }

  closeContactDialog(): void {
    this.router.navigate(['../'], { relativeTo: this.route.parent });
    this.dialogRef.close(false);
  }
}
