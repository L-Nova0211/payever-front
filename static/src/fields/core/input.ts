/*
<html><head>
  <link href="https://fonts.googleapis.com/css?family=Roboto:300&amp;display=swap" rel="stylesheet"/>
  <style>
</style>
<body>
<script>
  <!-- Script goes here -->
</script>
</body>
*/

const EVENT_KEY = 'pe-iframe-input';

enum EnvEnum {
  Test = 'test',
  Stage = 'stage',
  Live = 'live',
}

interface InputParamsInterface {
  iframeId?: string;
  env?: EnvEnum;
  flowId?: string;
  formToken?: string;
  guestToken?: string;
  formKey?: string;
}

enum InputTypeEnum {
  Text = 'text',
  Number = 'number',
  Password = 'password',
  Email = 'email',
}

interface ConfigInterface {
  type: InputTypeEnum;
  minLength: number;
  maxLength: number;
  numberMin: number;
  numberMax: number;
  numberIsInteger: boolean;
  defaultValue: string;
}

enum EventActionEnum {
  SetFocused = 'setFocused',
  SetDisabled = 'setDisabled',
  SetEnabled = 'setEnabled',
  SetRequired = 'setRequired',
  SetOptional = 'setOptional',
  SetConfig = 'setConfig',
}

interface EventValueInterface {
  formToken: string;
  formKey: string;
  action: EventActionEnum;
  data: ConfigInterface;
}

enum PostMessageTypeEnum {
  Ready = 'ready',
  ValueChange = 'valueChange',
  FocusChange = 'focusChange',
  SavingValueStatusChange = 'savingValueStatusChange',
  CriticalError = 'criticalError',
}

interface PostMessageInterface {
  iframeId: string;
  eventKey: string;
  formToken: string;
  formKey: string;
  eventType: PostMessageTypeEnum;
  value: any;
  focused: boolean;
  savingValue: boolean;
  lastError: string;
  invalid: boolean;
  validationError: string;
}

export class FieldInput {

  public readonly allowedInputTypes: InputTypeEnum[] = [
    InputTypeEnum.Text,
    InputTypeEnum.Number,
    InputTypeEnum.Password,
    InputTypeEnum.Email,
  ];

  protected config: ConfigInterface = {
    type: InputTypeEnum.Text,
    minLength: null,
    maxLength: null,
    numberMin: null,
    numberMax: null,
    numberIsInteger: null,
    defaultValue: '',
  };

  protected fakeElem: HTMLDivElement = null; // fakeValueElem
  protected inputElem: HTMLInputElement = null; // inputElem

  protected styleSheet: HTMLStyleElement = null;

  protected sendValuePending = 500;

  protected invalid: boolean = false;
  protected validationError: string = null;

  private lastRequest: XMLHttpRequest = null;
  private lastTimeout: any = null;

  private lastError: string = null;

  private focused: boolean = false;
  private savingValue: boolean = false;
  private value: any = undefined;
  private starredValue: any = undefined;

  private urlParams: InputParamsInterface = null;

  constructor() {
    this.init();
    this.postInputMessage(PostMessageTypeEnum.Ready);
  }

  protected init(): void {
    this.urlParams = this.getUrlParams();
    this.addStylesToPage();
    // this.addFakeValueElemToPage();
    this.addInputElemToPage();
    this.addEventListener();
  }

  protected getStylesBody(): string {
    return `
  body.pe-iframe-input {
    margin: 0;
    padding: 0;
    overflow: hidden
  }
  .pe-iframe-input input,
  .pe-iframe-input input:focus,
  .pe-iframe-input textarea:focus,
  .pe-iframe-input select:focus,
  .pe-iframe-input #default-fake-value {
    outline: none;
    width: 100%; height: 20px; border: 0;
  }
  .pe-iframe-input input,
  .pe-iframe-input input:disabled,
  .pe-iframe-input #default-fake-value {
    font-size: 15px;
    font-family: "Roboto", sans-serif;
    font-weight: 300;
    text-overflow: ellipsis;
    color: rgba(17, 17, 17, 0.85);
    background-color: transparent;
  }
  .pe-iframe-input input:disabled {
    cursor: default;
  }
  .pe-iframe-input #default-fake-value {
    cursor: text;
    position: absolute;
    left: 0px;
    top: 0px;
  }
  .pe-iframe-input .hidden {
    display: none !important;
  }
`;
  }

  protected addStylesToPage(): void {
    const sheet = document.createElement('style');
    sheet.innerHTML = this.getStylesBody();
    document.body.appendChild(sheet);
    document.body.classList.add('pe-iframe-input');
    this.styleSheet = sheet;
  }

  protected addFakeValueElemToPage(): void {
    if (!this.fakeElem) {
      this.fakeElem = document.createElement('div');
      this.fakeElem.id = 'default-fake-value';
      this.fakeElem.classList.add('hidden');
      if (this.starredValue) {
        this.fakeElem.classList.remove('hidden');
        this.fakeElem.innerText = this.starredValue;
      }
      this.fakeElem.onclick = () => this.inputElem.focus();
      document.body.appendChild(this.fakeElem);
    }
  }

  protected addInputElemToPage(): void {
    this.inputElem = document.createElement('input');
    this.inputElem.oncopy = this.inputElem.oncut = () => false;

    this.inputElem.oninput = () => this.handleOnInput();
    this.inputElem.addEventListener( 'focus',  () => this.handleOnFocus(), false);
    this.inputElem.addEventListener( 'blur',  () => this.handleOnBlur(), false);

    document.body.appendChild(this.inputElem);
  }

  protected cleanupValue(value: any): any {
    return value;
  }

  // tslint:disable:cognitive-complexity
  protected handleOnInput(): void {
    const rawValue = this.inputElem.value;

    let newValue = rawValue.toString();
    const config = this.config;
    if (config.type === InputTypeEnum.Number) {
      if (config.numberIsInteger) {
        newValue = parseInt(rawValue, 10).toString();
      }
      if (this.isNumeric(config.numberMin) && parseFloat(newValue) < config.numberMin) {
        newValue = config.numberMin.toString();
      } else if (this.isNumeric(config.numberMax) && parseFloat(newValue) > config.numberMax) {
        newValue = config.numberMax.toString();
      }
      if (config.numberMin === 0 && config.numberIsInteger) {
        // For better UI
        newValue = newValue.replace(/[^0-9]/g, '') || (rawValue ? parseInt(rawValue.toString(), 10).toString() : '');
      }
    }
    if (this.isNumeric(config.maxLength) && newValue.length > config.maxLength) {
      newValue = newValue.substr(0, config.maxLength);
    }

    if (rawValue !== newValue) {
      this.inputElem.value = newValue;
    }

    newValue = this.cleanupValue(newValue);
    if (this.value !== newValue) {
      this.value = newValue;
      if (config.type === InputTypeEnum.Number) {
        this.starredValue = newValue.toString().replace(/[0-9]/g, '0');
      } else {
        this.starredValue = newValue.length ? Array(newValue.length + 1).join('*') : '';
      }
      if (this.fakeElem) {
        this.fakeElem.remove();
        this.fakeElem = null;
      }
      this.postInputMessage(PostMessageTypeEnum.ValueChange);
      this.sendValue();
    }
  }

  protected handleOnFocus(): void {
    if (this.inputElem.focus) {
      this.focused = true;
      if (this.fakeElem) this.fakeElem.classList.add('hidden');
      this.postInputMessage(PostMessageTypeEnum.FocusChange);
    }
  }

  protected handleOnBlur(): void {
    if (this.inputElem.blur) {
      this.focused = false;
      if (this.fakeElem) this.fakeElem.classList.remove('hidden');
      this.postInputMessage(PostMessageTypeEnum.FocusChange);
    }
  }

  protected getUrlParams(): InputParamsInterface {
    const params: InputParamsInterface = {};
    let search = decodeURIComponent(window.location.href.slice( window.location.href.indexOf( '?' ) + 1 ));
    if (search.indexOf('#') >= 0) {
      search = search.slice(0, search.indexOf('#'));
    }
    const definitions = search.split('&');

    for (const val of definitions) {
      const parts = val.split('=', 2);
      params[parts[0]] = parts[1];
    }

    return params;
  }

  protected applyConfigToInput(): void {
    if (this.config.type) {
      this.inputElem.setAttribute('type', this.config.type);
    }
  }

  protected sendValue(): void {
    this.savingValue = true;
    this.postInputMessage(PostMessageTypeEnum.SavingValueStatusChange);
    if (this.lastRequest) this.lastRequest.abort();
    if (this.lastTimeout) clearTimeout(this.lastTimeout);
    this.lastTimeout = setTimeout(() => {
      const json = JSON.stringify({
        [this.urlParams.formKey]: this.value,
      });
      if (!this.urlParams.formToken) {
        this.postCriticalError('Form token for safe input is not set');
      }
      if (!this.urlParams.flowId) {
        this.postCriticalError('Flow ID for safe input is not set');
      }
      if (!this.urlParams.guestToken) {
        this.postCriticalError('Guest token for safe input is not set');
      }
      const url = `${this.getBaseUrl()}/api/storage/${this.urlParams.formToken}/flow/${this.urlParams.flowId}`;
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.setRequestHeader('Authorization', `Bearer ${this.urlParams.guestToken}`);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 201 || xhr.status === 0) { // 0 is for abort
            this.savingValue = false;
          } else {
            console.error('Error appeared while saving safe input', url, xhr.status, this.urlParams, this.config);
            this.postCriticalError(`Error appeared ${xhr.status} occurred while saving safe input.`);
          }
          this.postInputMessage(PostMessageTypeEnum.SavingValueStatusChange);
        }
      };
      xhr.onerror = err => {
        console.error('Error while saving safe input', url, err, this.urlParams, this.config);
        this.postCriticalError(`Error ${xhr.status} occurred while saving safe input.`);
        // tslint:disable
        // this.savingValue = false;
        this.postInputMessage(PostMessageTypeEnum.SavingValueStatusChange);
      };
      xhr.send(json);
      this.lastRequest = xhr;
    }, this.sendValuePending);
  }

  protected isNumeric(n: any): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  protected isBoolean(val: any): boolean {
    return val === false || val === true;
  }

  protected postInputMessage(type: PostMessageTypeEnum): void {
    const event: PostMessageInterface = {
      eventKey: EVENT_KEY,
      iframeId: this.urlParams.iframeId,
      formToken: this.urlParams.formToken,
      formKey: this.urlParams.formKey,

      eventType: type,
      value: this.starredValue,
      focused: this.focused,
      savingValue: this.savingValue,

      lastError: this.lastError,

      invalid: this.invalid,
      validationError: this.validationError,
    };
    window.parent.postMessage(event, '*');
  }

  // tslint:disable:cognitive-complexity
  protected addEventListener(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      const value: EventValueInterface = event.data;
      if (value && this.urlParams.formKey &&
          value.formToken === this.urlParams.formToken &&
          value.formKey === this.urlParams.formKey
      ) {
        if (value.action === EventActionEnum.SetFocused) {
          this.inputElem.focus();
        } else if (value.action === EventActionEnum.SetDisabled) {
          this.inputElem.disabled = true;
        } else if (value.action === EventActionEnum.SetEnabled) {
          this.inputElem.disabled = false;
        } else if (value.action === EventActionEnum.SetRequired) {
          this.inputElem.required = true;
        } else if (value.action === EventActionEnum.SetOptional) {
          this.inputElem.required = false;
        } else if (value.action === EventActionEnum.SetConfig) {
          if (this.allowedInputTypes.indexOf(value.data.type) >= 0) {
            this.config.type = value.data.type;
          }
          if (this.isNumeric(value.data.minLength)) {
            this.config.minLength = value.data.minLength;
          }
          if (this.isNumeric(value.data.maxLength)) {
            this.config.maxLength = value.data.maxLength;
          }
          if (this.isNumeric(value.data.numberMin)) {
            this.config.numberMin = value.data.numberMin;
          }
          if (this.isNumeric(value.data.numberMax)) {
            this.config.numberMax = value.data.numberMax;
          }
          if (value.data.numberIsInteger) {
            this.config.numberIsInteger = value.data.numberIsInteger;
          }
          if (value.data.defaultValue) {
            this.starredValue = value.data.defaultValue;
          }
          this.addFakeValueElemToPage();
          this.applyConfigToInput();
        }
      }
    }, false);
  }

  protected getBaseUrl(): string {
    // TODO This is not perfect solution but we can't pass domain or env.json to this script (not safe)
    if (this.urlParams.env === EnvEnum.Live) {
      return 'https://payment-data-storage-backend.payever.org';
    } else if (this.urlParams.env === EnvEnum.Test) {
      return 'https://payment-data-storage-backend.test.devpayever.com';
    } else if (this.urlParams.env === EnvEnum.Stage) {
      return 'https://payment-data-storage-backend.staging.devpayever.com';
    }
    console.error('Invalid environment for input', this.urlParams, this.config);
    this.postCriticalError('Invalid environment for safe input');

    return 'https://payment-data-storage-backend.payever.org';
  }

  protected postCriticalError(message: string): void {
    console.error(message);
    this.lastError = message;
    this.postInputMessage(PostMessageTypeEnum.CriticalError);
  }
}
