import { ElementRef, Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { PeMessageUser } from '@pe/shared/chat';
import { ContactsService, RootFolderItemsInterface } from '@pe/shared/contacts';
import { PePickerDataInterface } from '@pe/ui';
import { PeUser, UserState } from '@pe/user';

import { PeMessageApiService } from './message-api.service';

@Injectable()
export class PeMessageChannelSettingsService {
  @SelectSnapshot(UserState.user) userData: PeUser;

  lazyLoadData$ = new BehaviorSubject<PePickerDataInterface[]>([]);
  timeoutHandle;
  destroyed$: Subject<void>;
  formContentRef: ElementRef;

  optionsItemWidth$ = new BehaviorSubject<number>(410);

  constructor(
    private contactsService: ContactsService,
    private peMessageApiService: PeMessageApiService,
  ) {}

  init(destroyed$: Subject<void>, formContentRef?: ElementRef) {
    this.destroyed$ = destroyed$;
    this.formContentRef = formContentRef;
  }

  keyUp(event, changeDetectorRef) {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }

    this.timeoutHandle = setTimeout(() => {
      if (event === '') {
        this.lazyLoadData$.next([]);
      } else {
        this.loadMembers(event, changeDetectorRef);
      }

      changeDetectorRef.detectChanges();
    }, 500);
  }

  loadMembers(value, changeDetectorRef) {
    combineLatest([
      this.contactsService.searchContacts({
        direction: 'desc',
        query: value,
        queryFields: [
          'firstName',
          'lastName',
        ],
      }).pipe(
        map((res: RootFolderItemsInterface) => {
          return res.collection;
        }),
      ),
      this.peMessageApiService.getUserList({
        filters: {
          $or: [
            { 'userAccount.firstName': { $regex: value, $options: 'i' } },
            { 'userAccount.lastName': { $regex: value, $options: 'i' } },
          ],
        },
      }),
    ]).pipe(
      tap(([contacts, userList]) => {
        if (this.formContentRef) {
          this.optionsItemWidth$.next(this.formContentRef.nativeElement.scrollWidth - 2);
        }

        const userListNormalized = [];
        userList.reduce( (userListNormalized, user: PeMessageUser) => {
          if (user._id !== this.userData._id) {
            userListNormalized.push({
              _id: user._id,
              image: user.userAccount.logo ?? './assets/icons/contact-grid.png',
              label: `${user.userAccount.firstName} ${user.userAccount.lastName}`,
              user: true,
            });
          }

          return userListNormalized;
        }, userListNormalized);


        const contactListNormalized = contacts.reduce((contactListNormalized, contact) => {
          if (contact.email || contact.metaUserId) {
            contactListNormalized.push({
              _id: contact.metaUserId ?? contact.serviceEntityId,
              image: contact.imageUrl ?? './assets/icons/contact-grid.png',
              label: `${contact.firstName} ${contact.lastName}`,
              user: !!contact.metaUserId,
            });
          }

          return contactListNormalized;
        }, []);

        this.lazyLoadData$.next([
          ...contactListNormalized,
          ...userListNormalized,
        ]);

        changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$),
      catchError((err) => {
        this.lazyLoadData$.next([]);
        changeDetectorRef.detectChanges();

        return EMPTY;
      }),
    ).subscribe();
  }

}
