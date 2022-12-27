import { Injectable } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';

import { PeChatMessage, PeMessageChat } from '@pe/shared/chat';

import { PeMessageChatType } from '../enums/message-chat-type.enum';

import { PeMessageApiService } from './message-api.service';

@Injectable()
export class MessageStateService {
  private readonly conversationList$ = new BehaviorSubject<PeMessageChat[]>(null);
  private readonly conversation$ = new BehaviorSubject<Object>({});

  constructor(private peMessageApiService: PeMessageApiService) { }

  public get conversationList():PeMessageChat[] {
    return this.conversationList$.value;
  }

  public set conversationList(list: PeMessageChat[]) {
    this.conversationList$.next(list);
  }

  public getConversationListOnce(app: string, resetCache = false, folderId?: string): Observable<PeMessageChat[]> {
    return this.getConversationList(app, resetCache, folderId).pipe(filter(d => !!d), take(1));
  }

  private getConversationList(app: string, resetCache = false, folderId?: string): Observable<PeMessageChat[]> {
    return this.conversationList$.value && !resetCache
      ? of(this.conversationList$.value)
      : this.peMessageApiService.getConversationList(folderId)
          .pipe(
            catchError(() => []),
            tap((ret) => {
              this.conversationList$.next(ret);
            }),
            switchMap(() => this.conversationList$));
  }

  public getConversationOnce(id: string, type: PeMessageChatType, resetCache = false): Observable<any> {
    return this.getConversation(id, type, resetCache).pipe(filter(d => !!d), take(1));
  }

  private getConversation(id: string, type: PeMessageChatType, resetCache = false): Observable<any> {
    return this.conversation$.value?.[id] && !resetCache
      ? of(cloneDeep(this.conversation$.value[id]))
      : of(type)
          .pipe(
            switchMap((chatType) => {
              switch (chatType) {
                case PeMessageChatType.Chat:
                  return this.peMessageApiService.getChat(id);
                case PeMessageChatType.Group:
                  return this.peMessageApiService.getGroup(id);
                default:
                  return this.peMessageApiService.getChannel(id, type);
              }
            }),
            catchError(() => []),
            switchMap((res) => {
              const conversationObj = this.conversation$.value;
              conversationObj[id] = Array.isArray(res) ? res[0] : res;
              this.conversation$.next(conversationObj);

              return this.conversation$;
            }),
            map(conversationObj => cloneDeep(conversationObj[id])));
  }

  public messagePosted(messageToAdd: PeChatMessage) {
    const conversation: PeMessageChat = this.conversation$.value[messageToAdd.chat];
    conversation?.messages && conversation.messages.push(messageToAdd);
  }

  public messageUpdated(messageToUpdate: PeChatMessage) {
    const conversation: PeMessageChat = this.conversation$.value[messageToUpdate.chat];
    const updateMessage = (messages: PeChatMessage[]) => {
      const messageIndex = messages.findIndex(message => message._id === messageToUpdate._id);
      messages.splice(messageIndex, 1, messageToUpdate);
    };
    conversation?.messages && updateMessage(conversation.messages);
  }

  public messageDeleted(messageToDelete: PeChatMessage) {
    const conversation: PeMessageChat = this.conversation$.value[messageToDelete.chat];
    const removeMessage = (messages: PeChatMessage[]) => {
      messages = messages.filter(message => message._id !== messageToDelete._id);
    };
    conversation?.messages && removeMessage(conversation.messages);
  }

  public memberIncluded(userAccount) {
    const conversation: PeMessageChat = this.conversation$.value[userAccount.chat];
    if (conversation?.membersInfo) {
      conversation.membersInfo.push(userAccount);
    } else if (conversation) {
      conversation.membersInfo = [userAccount];
    }
  }
}
