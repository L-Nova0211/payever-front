import { Component, ContentChild, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';

import { AppThemeEnum } from '@pe/common';
import { ActionSubmitComponent } from '../../components/actions/action-submit/action-submit.component';

@Component({
  selector: 'pe-action-container',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
})
export class ActionContainerComponent {
  @Input() theme: AppThemeEnum;

  @Input() set isLoading(loading: boolean){
    this.isLoading$.next(loading);
    this.hasLoading = true;
  };

  @Input() submitTitleTranslateKey: string;

  @Input() cancelTranslateKey = 'transactions.actions.cancel';
  @Input() doneTranslateKey = 'transactions.actions.done';
  @Input() titleTranslateKey: string;

  @Output() closeEvent = new EventEmitter<void>();
  @Output() submitEvent = new EventEmitter<void>();

  private isLoading$ = new Subject<boolean>();

  private hasLoading = false;

  get useSubmitAction(): boolean {
    return !!this.submitTitleTranslateKey && this.hasLoading;
  }

  onClose(): void {
    this.closeEvent.emit();
  }

  onSubmit():void {
    this.submitEvent.emit();
  }

}
