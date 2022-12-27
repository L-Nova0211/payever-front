import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject } from 'rxjs';
import { share } from 'rxjs/operators';

import { MessageBus } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { ContactsAppState } from '@pe/shared/contacts';

import { PeContactsContactStatusEnum } from '../enums';

@Injectable()
export class ContactsListService {
  @SelectSnapshot(ContactsAppState.popupMode) popupMode: boolean;

  public readonly confirmation$ = this.messageBus.listen<boolean>('confirm').pipe(share());
  public lastGridView: PeGridView = null;
  public selectedFolder: FolderItem = null;

  constructor(
    private messageBus: MessageBus,
    private translateService: TranslateService,
  ) { }

  public contactsToGridItemMapper(contacts: any[]): PeGridItem[] {
    return contacts
      .map((contact) => {
      const fullName = `${contact.firstName} ${contact.lastName}`;

      return {
        // Contact BE response, sends a different id in _id and serviceEntityId
        // For all APIs except move-to-folder we have to use the serviceEntityId, else _id
        id: contact.serviceEntityId || contact.id || contact._id,
        action: this.popupMode ? null : {
          label: this.translateService.translate('contacts-app.actions.open'),
          more: true,
        },
        badge: {
          backgroundColor: contact?.status === PeContactsContactStatusEnum.APPROVED ? '#0371e2' : null,
          color: contact?.status === PeContactsContactStatusEnum.APPROVED ? '#fff' : null,
          label: contact?.status ? PeContactsContactStatusEnum[contact.status] : null,
        },
        columns: [
          {
            name: 'name',
            value: 'fullName',
          },
          {
            name: 'country',
            value: contact?.country ?? '',
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
        data: {
          // Contact BE response, sends a different id in _id and serviceEntityId
          // For all APIs except move-to-folder we have to use the serviceEntityId, else _id
          // so for move actions.using contact.data.id
          id: contact._id || contact.serviceEntityId || contact.id,
          approve: {
            backgroundColor: contact?.status !== PeContactsContactStatusEnum.APPROVED ? '#0371e2' : null,
            color: contact?.status ? '#fff' : null,
            label: contact?.status === PeContactsContactStatusEnum.APPROVED ? 'Deny': 'Approve' ,
          },
          country: contact.country,
          email: contact.email,
          firstName: contact.firstName,
          fullName: fullName,
          isDraggable: true,
          lastName: contact.lastName,
          serviceEntityId: contact.serviceEntityId,
          status: contact?.status,
          userId: contact?.userId,
          metaUserId: contact?.metaUserId,
        },
        image: contact?.imageUrl ?? './assets/icons/contact-grid.png',
        itemLoader$: new BehaviorSubject<boolean>(false),
        title: fullName,
        type: PeGridItemType.Item,
      };
    });
  }
}
