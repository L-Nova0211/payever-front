import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { Contact, FieldGroup } from '../interfaces';

@Injectable()
export class ContactsStoreService {
  public contactId: string;
  public field: FieldGroup;
  public customFormFieldGroup: FormGroup;
  public grid: 'contact' | 'group';
  public folderId: string;
  public updatedGridItem$ = new BehaviorSubject<any>(null);

  private contactData: Contact;

  saveContactData(data: Contact): void {
    this.contactData = data;
    if (!this.contactData.fieldGroups) {
      this.contactData.fieldGroups = [];
    }
  }

  getContactData(): Contact {
    return this.contactData;
  }
}
