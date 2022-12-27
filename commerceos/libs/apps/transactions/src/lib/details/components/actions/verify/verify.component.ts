import { ChangeDetectionStrategy, Component, HostBinding, Injector, OnInit } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { map, shareReplay, tap, takeUntil } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';

import { AbstractAction, ActionTypeEnum, VERIFY_PAYMENTS_CONTROLS } from '../../../../shared';
import { GuarantorTypeEnum } from '../../../../shared/enums';
import { VerifyPayloadInterface } from '../../../../shared/interfaces/action.interface';


@Component({
  selector: 'pe-verify-action',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss', '../actions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class ActionVerifyComponent extends AbstractAction implements OnInit {
  @HostBinding('class') get themeClass(): AppThemeEnum {
    return this.theme;
  }

  isSubmitted = false;
  verify$ = new Subject<void>();

  showById$ = this.order$.pipe(
    map(order => VERIFY_PAYMENTS_CONTROLS[order.payment_option.type]),
    shareReplay(1),
  );

  showSimple$ = this.order$.pipe(
    map(order => !!order.details.pos_verify_type),
    shareReplay(1),
  );

  typeErrorKey: string;

  get isGuarantor (): boolean {
    return this.order.details?.guarantor_type && this.order.details?.guarantor_type !== GuarantorTypeEnum.NONE;
  }

  constructor(
    public injector: Injector,
  ) {
    super(injector);
  }

  seTypeErrorKey(key: string): void {
    this.typeErrorKey = key;
  }

  ngOnInit(): void {
    this.getData();
  }

  done(): void {
    this.verify$.next();
  }

  // It is necessary to output errors depending on the type of verification
  showError(error) {
    this.toggleMessage(this.typeErrorKey);
  }

  verify({ data, dataKey }: VerifyPayloadInterface): void {
    this.isSubmitted = true;

    this.sendAction(
      data,
      ActionTypeEnum.Verify,
      dataKey,
      false
    );
  }

  createForm(): void {}

  private toggleMessage(translateKey: string): void {
    const key = this.translateService.hasTranslation(translateKey) ? translateKey : 'transactions.errors.unknown';
    this.snackbarService.toggle(true, {
      content: this.translateService.translate(key),
    });
  }
}
