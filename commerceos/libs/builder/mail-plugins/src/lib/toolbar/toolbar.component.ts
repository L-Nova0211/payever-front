import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, map, startWith, takeUntil, tap, throttleTime } from 'rxjs/operators';

import { PebEditorAbstractToolbar } from '@pe/builder-abstract';
import { PebEditorCommand, PebScreen, pebScreenDocumentWidthList } from '@pe/builder-core';
import { MessageBus } from '@pe/common';
import { PebSelectComponent } from '@pe/ui';

@Component({
  selector: 'peb-mail-editor-toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorMailToolbarComponent implements PebEditorAbstractToolbar, OnInit, OnDestroy {

  @Output() execCommand = new EventEmitter<PebEditorCommand>();

  @ViewChild('selectSender', { static: false }) selectSender: PebSelectComponent;

  contacts = [];
  filteredContacts$;
  separatorKeysCodes: number[] = [ENTER, COMMA, TAB];
  recipients = [];
  recipientCtrl = new FormControl();
  loading = false;
  theme = 'dark';
  destroy$ = new Subject<void>();
  form = new FormGroup({
    recipients: new FormControl(null),
    subject: new FormControl(null),
    sender: new FormControl(null),
    testMailRecipient: new FormControl(null),
  });

  screenSize: PebScreen = this.getScreenWidth();
  pebScreen = PebScreen;

  sendersList = [];

  public cdr = this.injector.get(ChangeDetectorRef);
  private elementRef = this.injector.get(ElementRef);
  private messageBus = this.injector.get(MessageBus);

  constructor(
    private injector: Injector,
  ) {
  }

  @HostBinding('class.skeleton')
  get hostSkeletonClass(): boolean {
    return this.loading;
  }

  get nativeElement() {
    return this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(
      throttleTime(250, animationFrameScheduler, { leading: true, trailing: true }),
      tap((value) => {
        this.messageBus.emit('message.toolbar.change', value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('message.toolbar.reply').pipe(
      filter(config => !!config && !!Object.keys(config).length),
      tap(({ recipients, subject, sender, testMailRecipient }:
             { recipients: string[], subject: string, sender: string, testMailRecipient: string }) => {
        this.recipients = [];
        recipients?.forEach(recipient => this.addRecipientChip(recipient));
        this.form.get('subject').patchValue(subject);
        this.form.get('sender').patchValue(sender);
        this.form.get('testMailRecipient').patchValue(testMailRecipient);
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('message.toolbar.set-users').pipe(
      filter((usersList: any) => !!usersList.length),
      tap((usersList: any) => {
        this.sendersList = usersList.map((user: any) => ({
          name: `${user.userAccount.firstName} ${user.userAccount.lastName}`,
          email: user.userAccount.email,
        }));
        this.cdr.detectChanges();
        this.form.get('sender').patchValue(this.sendersList[0].email);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.filteredContacts$ = this.form.get('recipients').valueChanges.pipe(
      startWith(['']),
      map(value => this.filterAutocomplete(value)),
    );

    this.messageBus.listen('message.mail.contacts-set').pipe(
      tap((contactsList: any) => {
        contactsList?.forEach((recipient) => {
          if (!this.form.get('recipients').value?.includes(recipient.value)) {
            this.addRecipientChip(recipient.value);
          }
        });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openContactDialog(): void {
    this.messageBus.emit('message.mail.contacts-open', null);
  }

  onSendTestMail(): void {
    this.messageBus.emit('message.mail.send-test', this.form.value);
  }

  addRecipientChip(chipValue: string): void {
    if (chipValue) {
      const value = (chipValue || '').trim();
      if (value) {
        this.recipients.push(value);
      }
      this.recipientCtrl.patchValue(null);
      this.form.get('recipients').patchValue(this.recipients);
      this.cdr.detectChanges();
    }
  }

  removeRecipientChip(index: number): void {
    this.recipients.splice(index, 1);
    this.form.get('recipients').patchValue(this.recipients);
  }

  trackContact(index: number, option): any {
    return option.title;
  }

  onSelectDropdown(): void {
    this.selectSender.showDropdown();
  }

  private filterAutocomplete(values: string[]) {
    const value = values[values.length - 1];
    const filterValue = value.toLowerCase().replace(/\s/g, '');

    return this.contacts.filter(contact =>
      contact.title.toLowerCase().replace(/\s/g, '').includes(filterValue));
  }

  private getScreenWidth(): PebScreen {
    return window.innerWidth > pebScreenDocumentWidthList.tablet ? PebScreen.Desktop :
      window.innerWidth > pebScreenDocumentWidthList.mobile ? PebScreen.Tablet : PebScreen.Mobile;
  }
}
