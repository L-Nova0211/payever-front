import { Component, Injector, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { EMPTY } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';

import { SectionInterface } from '../../../components/widget-statistics/widget-statistics.component';
import { ContactsInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'contacts-widget',
  templateUrl: './contacts-widget.component.html',
  styleUrls: ['./contacts-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Input() widget: Widget;

  sections: SectionInterface[] = [{
    title: 'widgets.contacts.sections.contacts.title',
    value: '0',
  },
  {
    title: 'widgets.contacts.sections.groups.title',
    value: '0',
  }];

  addContactLoading = false;
  readonly appName: string = 'contacts';

  constructor(injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,
    ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_CONTACTS_DATA);
  }

  ngOnInit() {
    this.editWidgetsService.defaultContactsSubject$.pipe(
      tap((contact: ContactsInterface) => {
        this.widget = {
          ...this.widget,
          data: [
            {
              title: 'Contacts',
              subtitle: contact?.data.contactsCount?.toString() || '0',
            },
            {
              title: 'Group',
              subtitle: contact?.data.groupsCount?.toString() || '0',
            },
          ],
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

  }

  onAddContact() {
    this.addContactLoading = true;
    this.cdr.detectChanges();
    this.loaderService.loadMicroScript(this.appName, this.businessData._id).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(
      () => {
        this.router.navigate(['business', this.businessData._id, this.appName, 'add-contact'])
          .then(() => {
            this.addContactLoading = false;
            this.cdr.detectChanges();
          });
      },
      () => {
        this.addContactLoading = false;
        this.cdr.detectChanges();
      }
    );
  }
}
