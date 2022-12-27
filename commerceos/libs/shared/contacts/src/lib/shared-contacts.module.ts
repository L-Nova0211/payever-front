import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { ContactsState } from '@pe/common';
import { ContactsAppState} from './store/contacts.state';

export const NgxsFeatureModule = NgxsModule.forFeature([ContactsState, ContactsAppState]);
@NgModule({
  imports: [CommonModule, NgxsFeatureModule],
})
export class SharedContactsModule {}
