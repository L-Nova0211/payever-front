import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import {
  ExecuteCommandAction,
  TextEditorComponent,
  TextEditorService,
  TextEditorToolbarComponent,
} from '@pe/text-editor';

import { PeInvoiceApi } from '../../services/abstract.invoice.api';

@Component({
  selector: 'pe-invoice-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeInvoiceSettingsEmailComponent {
  @ViewChild('editorToolbar') editorToolbar: TextEditorToolbarComponent;
  @ViewChild('editorToolbar', { read: ElementRef }) editorToolbarElement: ElementRef;
  @ViewChild('textEditor') textEditor: TextEditorComponent;

  @HostBinding('id') hostId = 'editor-description';

  @Input()
  @HostBinding('class.invalid')
  invalid = false;

  console = console;

  @Input()
  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this.hasDescriptionText = value && !!value.length;
    this._description = value;
  }

  message = ' ';
  expandable: any = {
    general: true,
  }

  @Input()
  placeholder: string;

  @Input()
  get compactSize(): boolean {
    return this._compactSize;
  }

  set compactSize(value: boolean) {
    this._compactSize = value;
  }

  editorFocused: boolean;
  hasDescriptionText: boolean;
  toolbarHeight = 0;
  emailForm: FormGroup;
  settings: any;
  allowValidation: boolean;

  errors = {
    email: {
      name: 'email',
      hasError: false,
      errorMessage: '',
    },
    inbox_userName: {
      name: 'Inbox userName',
      hasError: false,
      errorMessage: '',
    },
    inbox_password: {
      name: 'Inbox password',
      hasError: false,
      errorMessage: '',
    },
    inbox_server: {
      name: 'Inbox server',
      hasError: false,
      errorMessage: '',
    },
    inbox_port: {
      name: 'Inbox port',
      hasError: false,
      errorMessage: '',
    },
    inbox_protection: {
      name: 'Inbox protection',
      hasError: false,
      errorMessage: '',
    },
    outbox_userName: {
      name: 'Outbox userName',
      hasError: false,
      errorMessage: '',
    },
    outbox_password: {
      name: 'Outbox password',
      hasError: false,
      errorMessage: '',
    },
    outbox_server: {
      name: 'Outbox server',
      hasError: false,
      errorMessage: '',
    },
    outbox_protection: {
      name: 'Outbox protection',
      hasError: false,
      errorMessage: '',
    },
    outbox_port: {
      name: 'Outbox port',
      hasError: false,
      errorMessage: '',
    },
    message: {
      name: 'message',
      hasError: false,
      errorMessage: '',
    },
    customerMessageSubject: {
      name: 'Message',
      hasError: false,
      errorMessage: '',
    },
  }

  private _description: string;
  private _compactSize: boolean;
  constructor(
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private textEditorService: TextEditorService,
    private api: PeInvoiceApi,
    private fb: FormBuilder,
    private destroy$: PeDestroyService
  ) {
    config.doneBtnCallback = this.saveSettings;

    this.emailForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        inbox_userName: ['', Validators.required],
        inbox_password: ['', [Validators.required, Validators.minLength(8)]],
        inbox_server: ['', Validators.required],
        inbox_port: ['', Validators.required],
        inbox_protection: ['SSL'],
        outbox_userName: ['', Validators.required],
        outbox_password: ['', [Validators.required, Validators.minLength(8)]],
        outbox_server: ['', Validators.required],
        outbox_port: ['', Validators.required],
        outbox_protection: ['SSL'],
        message: ['', Validators.required],
        customerMessageSubject: [''],
      }
    )
    this.initSettings()
  }

  initSettings() {
    this.api.getEmailSettings()
      .pipe(catchError(() => { return of({}); }))
      .subscribe((data) => {
      this.settings = data;
      this.emailForm.setValue({
        email: data.email || null,
        inbox_userName: data.inboxServerSettings?.username || null,
        inbox_password: '' || null,
        inbox_server: data.inboxServerSettings?.server || null,
        inbox_port: data.inboxServerSettings?.port || null,
        inbox_protection: data.inboxServerSettings?.protection || null,
        outbox_userName: data.outboxServerSettings?.username || null,
        outbox_password: '' || null,
        outbox_server: data.outboxServerSettings?.server || null,
        outbox_port: data.outboxServerSettings?.port || null,
        outbox_protection: data.outboxServerSettings?.protection || null,
        message: data.customerMessage || null,
        customerMessageSubject: data.customerMessageSubject || null,
      });

      this.emailForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (this.allowValidation) {
          this.validateForms();
        }
      })
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    })
  }

  editorFocus(): void {
    this.editorFocused = true;
    // this.recalculateHeight();
  }

  onTextEditorAction(action: ExecuteCommandAction): void {
  }

  onDescriptionChange(text: string): void {
  }


  panelStateTrigger(panel: string) {
    this.expandable = { [panel]: true };
    this.cdr.detectChanges();
  }


  saveSettings = () => {
    this.validateForms();
    this.allowValidation = true;
    if (this.emailForm.invalid) {
      return
    }

    const formInfo = this.emailForm.value
    const payload = {
      email: formInfo.email,
      inboxServerSettings: {
        username: formInfo.inbox_userName,
        password: formInfo.inbox_password,
        server: formInfo.inbox_server,
        port: formInfo.inbox_port,
        protection: formInfo.inbox_protection,
      },
      outboxServerSettings: {
        username: formInfo.outbox_userName,
        password: formInfo.outbox_password,
        server: formInfo.outbox_server,
        port: formInfo.outbox_port,
        protection: formInfo.outbox_protection,
      },
      customerMessageSubject:formInfo.customerMessageSubject,
      customerMessage: formInfo.message,
    };
    this.api.updateEmailSettings(payload).subscribe(_ => this.overlay.close())
  }

  validateForms() {
    for (let control in this.emailForm.controls) {

      if (this.emailForm.controls[control].invalid) {
        if(control === 'email') {
          this.expandable.general = true;
        }
        if(['inbox_userName', 'inbox_password', 'inbox_server',
         'inbox_port', 'inbox_protection'].includes(control)) {
          this.expandable.inbox = true;
        }
        if([, 'outbox_userName', 'outbox_password',
        'outbox_server', 'outbox_port', 'outbox_protection'].includes(control)) {
          this.expandable.outbox = true;
        }
        if([, 'customerMessageSubject', 'message'].includes(control)) {
          this.expandable.message = true;
        }
        this.errors[control].hasError = true;

        if (this.emailForm.controls[control].errors.required) {
          this.errors[control].errorMessage = `${this.errors[control].name} is required`
        }
        if (this.emailForm.controls[control].errors.minlength) {
          this.errors[control].errorMessage = `Password should be 8 or more characters`
        }
        if (this.emailForm.controls[control].errors.email) {
          this.errors[control].errorMessage = 'email is invalid';
        }
      } else {
        this.errors[control].hasError = false;
      }
    }
  }

}
