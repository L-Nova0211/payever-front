import { Component, HostBinding, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AppThemeEnum } from '@pe/common';

import { PeMessageConversationEmptyListInterface } from './empty-list.interface';

@Component({
  selector: 'pe-message-conversation-empty-list',
  templateUrl: './empty-list.component.html',
  styleUrls: ['./empty-list.component.scss'],
})
export class PeMessageConversationEmptyListComponent {
  @Input() set emptyListStatus(emptyListStatus: PeMessageConversationEmptyListInterface) {
    this.emptyListStatus$.next(emptyListStatus);
  }

  @Input() set isLoading(loading) {
    this.isLoading$.next(loading);
  }

  @Input() public theme = AppThemeEnum.default;

  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  public readonly emptyListStatus$ = new BehaviorSubject<PeMessageConversationEmptyListInterface>({
    hideList: false,
    listEmpty: false,
  });

  @HostBinding('style.display')
  private get hideEmptyList(): string {
    return this.isLoading$.value || this.emptyListStatus$.value.hideList ? 'none' : 'flex';
  }

  public get emptyListNotification(): string {
    return this.emptyListStatus$.value.listEmpty
      ? 'message-app.sidebar.empty_list'
      : 'message-app.sidebar.conversations_not_found';
  }
}
