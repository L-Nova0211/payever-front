import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { take } from 'rxjs/operators';

import { StorageService } from '../../services';
import { BaseSettingsComponent } from '../settings/base-settings.component';

@Component({
  selector: 'checkout-delete-confirm',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent extends BaseSettingsComponent implements OnInit {

  @Input() checkoutUuid: string;

  @Output() cancel: EventEmitter<boolean> = new EventEmitter();
  @Output() confirm: EventEmitter<boolean> = new EventEmitter();

  isCheckoutDeleted = false;
  loading: boolean;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  onDeleteCheckout() {
    if (this.checkoutUuid) {
      this.loading = true;
      this.storageService.deleteCheckout(this.checkoutUuid)
        .pipe(take(1)).subscribe(() => {
        this.isCheckoutDeleted = true;
        this.loading = false;
        this.cdr.detectChanges();
      }, (err) => {
        this.showError(err.message);
        this.loading = false;
        this.cancel.emit();
      });
    }
  }

  returnAfterDelete() {
    this.confirm.emit(true);
  }
}
