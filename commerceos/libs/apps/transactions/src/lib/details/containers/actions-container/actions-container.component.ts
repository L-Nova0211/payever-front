import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { ActionTypeUIEnum } from '../../../shared/enums/action-type.enum';
import { UIActionInterface } from '../../../shared/interfaces/action.interface';

import { ActionsContainerService } from './actions-container.service';

@Component({
  selector: 'pe-actions-container',
  templateUrl: './actions-container.component.html',
  styleUrls: ['./actions-container.component.scss'],
  providers: [
    ActionsContainerService,
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsListContainerComponent {
  @Input() uiActions: UIActionInterface[] = [];
  @Input() theme: AppThemeEnum = AppThemeEnum.default;
  @Input() isShowMore = false;
  @Input() moreIcon: string;
  @Input() typeView: 'column' | 'row' = 'row';

  @Output() selected = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();
  @Output() clickMore = new EventEmitter<void>();

  ActionTypeUIEnum: typeof ActionTypeUIEnum = ActionTypeUIEnum;

  private loading$: BehaviorSubject<boolean>;

  constructor(
    private httpClient: HttpClient,
    private confirmScreenService: ConfirmScreenService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private actionsContainerService: ActionsContainerService,
    private destroyed$: PeDestroyService
  ) {
    this.actionsContainerService.closed$
    .pipe(
      tap(() => this.closed.emit()),
      takeUntil(this.destroyed$)
    )
    .subscribe()
  }

  trackByFn(index: number, item: UIActionInterface): string {
    return item?.labelTranslated ?? item.label;
  }

  onSelected(actionIndex: number): void {
    this.selected.emit(actionIndex);
  }

  onClickLink(e: Event, action: UIActionInterface): void {
    e.preventDefault();

    action.showConfirm
      ? this.actionsContainerService.showConfirm(action)
      : this.actionsContainerService.downloadByLink(action.href, action?.errorMessage, action.onClick);
  }
}
