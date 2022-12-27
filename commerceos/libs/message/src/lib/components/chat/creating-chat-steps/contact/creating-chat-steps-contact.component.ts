import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  ElementRef,
  ViewChild,
  Input,
  SimpleChanges,
  OnChanges,
  HostBinding,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, EMPTY, Observable, of, Subject, throwError, timer } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  map,
  pluck,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { EnvironmentConfigInterface, EnvService, PeDestroyService, PeGridItem, PE_ENV } from '@pe/common';
import { PeValidators } from '@pe/forms-core';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelType, PeMessageChatSteep } from '@pe/shared/chat';
import {  Contact, ContactsAppState, ContactsService } from '@pe/shared/contacts';
import { SnackbarService } from '@pe/snackbar';
import { PePickerComponent } from '@pe/ui';

import { ChatFacadeClass } from '../../../../classes/chat/chat-facade.class';
import { PeMessageChatType,  PeContactPopupMode } from '../../../../enums';
import {
  ContactsDialogService,
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageEnvService,
} from '../../../../services';


const DEFAULT_CONTACT_IMAGE = '../../assets/icons/contact-grid.png';

@Component({
  selector: 'pe-creating-chat-steps-contact',
  templateUrl: './creating-chat-steps-contact.component.html',
  styleUrls: ['./creating-chat-steps-contact.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCreatingChatStepsContactComponent implements OnInit, OnChanges {
  @SelectSnapshot(ContactsAppState.contacts) selectedContacts: PeGridItem[];

  @HostBinding('class') hostClass = this.peOverlayData.theme;
  @ViewChild('formContent', { static: true }) formContentRef: ElementRef;
  @ViewChild('slugInput') slugInputRef: ElementRef;
  @ViewChild('pePicker') pePicker: PePickerComponent;

  @Input() step: PeMessageChatSteep;
  @Output() changeStep: EventEmitter<string> = new EventEmitter();

  @Input() chatClass: ChatFacadeClass;
  @Input() chatType = PeMessageChatType.Channel;
  @Input() set type(value: PeMessageChannelType) {
    const suffix = 'invite'; //value === PeMessageChannelType.Private ? 'invite' : 'join';
    this.rootInvitationLink = `${this.environmentConfigInterface.frontend.commerceos}/message/${suffix}/`;
    this._type = value;
    this.changeDetectorRef.detectChanges();
  }

  @Input() set code(value: string) {
    this.additionalInfoGroup.patchValue(
      { invitationCode:
          this.type === PeMessageChannelType.Private
            ? this.rootInvitationLink + value
            : value,
      }
    );
    this._code = value;
  }

  get type(): PeMessageChannelType {
    return this._type;
  }

  get optionsItemWidth(): number {
    return this.formContentRef.nativeElement.offsetWidth - 2;
  }

  get members() {
    return this.additionalInfoGroup.controls.members.value;
  }

  get isPrivate() {
    return this.type === PeMessageChannelType.Private;
  }

  get isPublic() {
    return this.type === PeMessageChannelType.Public;
  }

  get getRootInvitationLink() {
    const len = this.rootInvitationLink.length;

    return this.rootInvitationLink.substring(0, 8)
      + '...' +
      this.rootInvitationLink.substring(len - 8, len) + this._code;
  }

  @Input() set invitationId(value: string) {
    this._invitationId = value;
  }

  @Input() set animationTypeStepDoneTrigger(value: boolean) {
    if (value) { this.slugInputRef?.nativeElement?.focus(); }
  }

  currentEmail = '';
  animatedFields = true;
  isLoading = true;
  copied = false;

  errorPrefix = 'message-app.channel.form.errors.';

  timeoutHandle;
  inviteLink = '';
  rootInvitationLink = `${this.environmentConfigInterface.frontend.commerceos}/message/`;
  linkTextButton = this.translateService.translate('message-app.channel.settings.copy-invite-link');
  additionalInfoGroup = this.formBuilder.group({
    members: [[]],
    invitationCode: [''],
  });

  PeMessageChannelType = PeMessageChannelType;

  PeMessageChatType = PeMessageChatType;
  errors: any = { };
  contacts$ = new BehaviorSubject<any[]>([])
  filterContacts$ = new Subject<string>();
  data = [];

  _code: string;
  _invitationId: string;
  _type: PeMessageChannelType;

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private router: Router,
    @Inject(EnvService) protected envService: PeMessageEnvService,
    private clipboard: Clipboard,
    private destroyed$: PeDestroyService,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
    private contactService: ContactsService,
    private contactDialogService: ContactsDialogService,
    private cdr: ChangeDetectorRef,
    private apiService:ApiService,
    protected peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    @Inject(PE_ENV) private environmentConfigInterface: EnvironmentConfigInterface,
  ) {
  }

  ngOnInit(): void {
    this.filterContacts$.pipe(
      debounceTime(500),
      startWith(''),
      switchMap(filter => this.filterContacts(filter)),
      tap(contacts => this.contacts$.next(contacts)),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  copyLink(): void {
    if (!this.copied) {
      const link = this.type === PeMessageChannelType.Private
      ? this.additionalInfoGroup.value.invitationCode
      : `${this.rootInvitationLink}${this.additionalInfoGroup.value.invitationCode}`;
      this.linkTextButton = this.translateService.translate('message-app.channel.settings.copied-invite-link');
      this.clipboard.copy(link);
      this.copied = true;

      timer(500).pipe(
        tap(() => {
          this.linkTextButton = this.translateService.translate('message-app.channel.settings.copy-invite-link');
          this.copied = false;
          this.changeDetectorRef.detectChanges();
        })
      ).subscribe();
    }
  }

  onKeyUp($event) {
    this.currentEmail = $event;
    this.filterContacts$.next($event);
  }

  hasError(field: string): boolean {
    return this.errors[field]?.hasError;
  }

  getErrors() {
    return Object.keys(this.errors);
  }

  getErrorMessageTranslation(key: string): string {
    return this.translateService.translate('message-app.channel.form.errors.' + key);
  }

  getErrorMessage(field: string): string {
    return this.errors[field]?.message;
  }

  setErrors(key: string = null, hasError: boolean = true, message: string = this.getErrorMessageTranslation(key)) {
    key === null ? this.errors = {} : this.errors = {
      [key]: {
        hasError,
        message,
      },
    };
    this.changeDetectorRef.detectChanges();
  }

  public addMember() {
    this.apiService.getAppsData(JSON.parse(localStorage.getItem('pe_opened_business'))._id).subscribe(response => {
      let indexContacts = response.findIndex(data=>data.code==='contacts');
      if (indexContacts !== -1 && response[indexContacts]?.installed) {
        this.router.navigate([`/business/${this.envService.businessId}/message/contacts/${PeContactPopupMode.AddMember}`]);
        this.contactDialogListener();
      } else {
        this.snackBarShow(this.getErrorMessageTranslation('contacts_app_required'),false);
      }
    });
  }

  public contactDialogListener() {
    this.contactDialogService.currentStatus.pipe(
      filter((isSave: boolean | null) => {
        return isSave !== null;
      }),
      tap((isSave: boolean) => {
        if (isSave) {
          const contacts = this.normalizeContactsData(this.selectedContacts);
          const filteredContacts = contacts
            .filter(contact => !this.members.find(member => member.email === contact.email));

          this.members.push(...filteredContacts);
          this.contacts$.next([]);

          this.cdr.detectChanges();
        }
      }),
      take(1),
    ).subscribe();
  }

  public normalizeContactsData(contacts): any[] {
    return contacts.map((element) => {

      return this.serializeContact({
        label: element.title,
        metaUserId: element.id,
        serviceEntityId: element.data.serviceEntityId,
        name: element.title,
        contactId: element.id,
        firstName: element.data.firstName,
        lastName: element.data.lastName,
        email: element.data.email,
      });
    });
  }

  public isInvalidEmail(email: string) : boolean {
    return new FormControl(email, [PeValidators.validEmailWithDomain()]).invalid;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (PeMessageChatSteep.Contacts === changes.step?.currentValue) {

      this.changeDetectorRef.detectChanges();

      let additionalSteep$ = of(null);
      const members = this.additionalInfoGroup.value.members ?? [];

      if (this.isPrivate && members.length > 0) {
        this.peOverlayData.isLoading$.next(true);
        additionalSteep$ = this.chatClass.inviteMembers(members, this.peMessageChatRoomListService, this._invitationId);

      } else if (
        this.isPublic
          && !this.errors?.invitationCode?.hasError
          && this.additionalInfoGroup.controls.invitationCode.value
      ) {
        const { title, description, photo } = this.chatClass.chat;
        this.peOverlayData.isLoading$.next(true);

        additionalSteep$ = this.peMessageApiService.patchChannel(
          this.chatClass.chat._id,
          {
            title,
            description,
            photo,
            slug: this.additionalInfoGroup.controls['invitationCode'].value,
          },
          this.chatClass.chat.business,
          ).pipe(
          switchMap( () => {
            if (members.length > 0) {
              return this.chatClass.inviteMembers(members, this.peMessageChatRoomListService, this._invitationId);
            }

            return of(null);
          }),
        );
      }

      if (!this.additionalInfoGroup.controls.invitationCode.value && this.members.length > 0) {
        additionalSteep$ = throwError({
          key: 'invitation_code',
          message: this.getErrorMessageTranslation('not_empty'),
        });
      }


      additionalSteep$.pipe(
        tap(() => {
          this.peOverlayData.onCloseSubject$.next(true);
        }),
        takeUntil(this.destroyed$),
        catchError((error) => {
          if (error.status === 409) {
            this.setErrors('already_created');
          }
          if (error.message && error.key) {
            this.setErrors(error.key, true, error.message);
          }
          this.changeStep.emit(changes.step?.previousValue);
          this.peOverlayData.isLoading$.next(false);
          this.changeDetectorRef.detectChanges();

          return EMPTY;
        })
      ).subscribe();
    }
  }

  onInvitationCodeFocus() {
    const invitationField = this.additionalInfoGroup.controls.invitationCode;
    if (this.isPublic && !invitationField.value && (invitationField.touched || invitationField.dirty)) {
      this.setErrors('invitation_code', true, this.getErrorMessageTranslation('not_empty'));
    }
  }

  copyInvite(): void {
    this.linkTextButton = this.translateService.translate('message-app.channel.settings.copied-invite-link');
    this.copied = true;

    timer(500).pipe(
      tap(() => {
        const link = this.type === PeMessageChannelType.Private
          ? this.additionalInfoGroup.value.invitationCode
          : `${this.rootInvitationLink}${this.additionalInfoGroup.value.invitationCode}`;
        this.clipboard.copy(link);
        this.linkTextButton = this.translateService.translate('message-app.channel.settings.copy-invite-link');
        this.copied = false;

        this.changeDetectorRef.detectChanges();
      }),
    ).subscribe();
  }

  private filterContacts(filter:string):Observable<Contact[]>{
    if (!filter){
      return of([]);
    }
    const options = {
        all: 0,
        orderBy: 'email',
        direction: 'desc',
        page: 1,
        limit: 10,
        query: `*${filter}*`,
        queryFields: ['email', 'firstName', 'lastName'],
        sort: ['desc'],
        currency: 'string',
    };

    return this.contactService.searchContacts(options).pipe(
      catchError(() => of({ collection: [] })),
      pluck('collection'),
      map((contacts: Contact[]) =>{
        const emailIsInvalid = this.isInvalidEmail(filter);
        const contactsNew = contacts.length === 0
          ? emailIsInvalid
            ? []
            : [this.serializeContact({ email: filter })]
          : contacts.map(contact => {
              return this.serializeContact(contact);
            });

          const filterUnique = contactsNew
            .filter(contact => !this.members.find(member => member.email === contact.email));

          if (filterUnique.length === 1 && this.peMessageChatRoomListService.isUserInChatAlready(filter)){
              this.snackBarShow(
                this.getErrorMessageTranslation('user_already_in_chat').replace('{userEmail}', filter),
                false
              );

            return [];
          }

          return filterUnique.filter(
            user => !this.peMessageChatRoomListService.activeChat.membersInfo.some(
              userInfo => user.email === userInfo.user.userAccount.email
            )
          );
        })
      );
  }

  public onChange($event: any) {
    this.setErrors();
  }

  public serializeContact(contact: any) {
    return {
      ...contact,
      label: contact.email,
      image: contact.imageUrl ?? DEFAULT_CONTACT_IMAGE,
      id: contact.serviceEntityId,
      _id: contact.serviceEntityId,
    };
  }

  snackBarShow(msg: string, success: boolean = true) {
    this.snackbarService.toggle(true, {
      content: msg,
      duration: 5000,
      iconId: success ? 'icon-commerceos-success' : 'icon-alert-24',
      iconSize: 24,
    });
  }

  close(): void {
    this.peOverlayData.onCloseSubject$.next(true);
  }

  keyUpSlugTyping(event) {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }

    this.timeoutHandle = setTimeout(() => {
      if (event !== '') {
        this.checkSlug(this.additionalInfoGroup.controls.invitationCode.value);
      }
      this.changeDetectorRef.detectChanges();
    }, 500);
  }

  checkSlug(slug) {
    this.peMessageApiService.getPublicChannelsBySlug(slug).pipe(
      tap(() => {
        this.setErrors('invitation_code', true, this.getErrorMessageTranslation('link_occupied'));
      }),
      catchError((err) => {
        this.setErrors('invitation_code', false, this.getErrorMessageTranslation('link_occupied'));

        return EMPTY;
      }),
    ).subscribe();
  }
}
