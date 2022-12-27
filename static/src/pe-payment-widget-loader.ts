import { EventEmitter } from 'eventemitter3';
import './pe-static'; // To load icons loader

export interface EnvironmentConfigInterface {
  custom: {
    [key: string]: string;
    cdn: string;
  };
  backend: {
    [key: string]: string;
    payments: string;
  };
  frontend: {
    [key: string]: string;
    checkout: string;
    checkoutWrapper: string;
    commerceos: string;
    paymentOptionsSantanderDe: string;
  };
}

export interface FlowInterface {
  id?: string;
  payment_option_id?: string;
  payment_options?: {
    id: number,
    payment_method: string,
  }[];
  billing_address?: AddressInterface;
  guest_token?: string;
}
export enum SalutationEnum {
  SALUTATION_MR = 'SALUTATION_MR',
  SALUTATION_MRS = 'SALUTATION_MRS',
}

export interface BaseAddressInterface {
  city?: string;
  country?: string;
  country_name?: string;
  discr?: string;
  extra_phone?: string;
  fax?: string;
  first_name?: string;
  id?: string | number;
  last_name?: string;
  mobile_phone?: string;
  phone?: string;
  salutation?: SalutationEnum;
  social_security_number?: string;
  street?: string;
  street_name?: string;
  street_number?: string;
  type?: string;
  zip_code?: string;
  apartment?: string;
  stateProvinceCode?: string;
}

export enum AddressTypeEnum {
  BILLING = 'billing',
  SHIPPING = 'shipping',
}

interface LoadPaymentConfigInterface {
  showSubmitButton: boolean;
  onSubmit: SubmitCallbackFunc;
  onReady: () => void;
  onStatus: (status: StatusInterface) => void;
  onError: (error: string) => void;
}

export interface AddressInterface extends BaseAddressInterface {
  company?: string;
  email?: string;
  full_address?: string;
  id?: number;
  type?: AddressTypeEnum;
}

interface PaymentCustomElementInterface {
  ceElem: string;
  envKey: string;
}

interface StatusInterface {
  loading?: boolean;
  disabled?: boolean;
  buttonText?: string;
}

type SubmitCallbackFunc = (done: () => void) => void;

const paymentCustomElements: {[key: string]: PaymentCustomElementInterface} = {
  santander_installment: { ceElem: 'payment-santander-de-embedded', envKey: 'paymentOptionsSantanderDe' },
  stripe: { ceElem: 'payment-stripe-embedded', envKey: 'paymentOptionsStripe' },
  stripe_directdebit: { ceElem: 'payment-stripe-direct-debit-embedded', envKey: 'paymentOptionsStripe' },
  santander_factoring_de: { ceElem: 'payment-santander-fact-de-embedded', envKey: 'paymentOptionsSantanderDeFact' },
  santander_invoice_de: { ceElem: 'payment-santander-invoice-de-embedded', envKey: 'paymentOptionsSantanderDeInvoice' },
};

export class PayeverPaymentWidgetLoader {

  private baseUrl: string | null = null;
  private apiCallId: string | null = null;
  private flow: FlowInterface | null = null;
  private guestToken: string | null = null;
  private envJson: EnvironmentConfigInterface | null = null;
  private emitter = new EventEmitter();
  private customElement: HTMLElement | null = null;
  private isPolyfillsLoaded: boolean = false;
  private isLoadingPayment: boolean = false;
  private isPatchingFlow: boolean = false;
  private loadedScripts: {[key: string]: boolean} = {};

  constructor() {
    console.log('PayeverPaymentWidgetLoader.constructor()'); // TODO Remove log
  }

  public init(baseUrl: string, apiCallId: string, successCallback: (payments: string[]) => void, failCallback: (error: string) => void): void {
    this.baseUrl = baseUrl;
    this.apiCallId = apiCallId;
    this.loadEnvJson((envJson: EnvironmentConfigInterface) => {
      this.createFlow(envJson, (flow: FlowInterface) => {
        this.flow = flow;
        this.envJson = envJson;
        this.loadPolyfills(envJson);
        if (flow.guest_token) {
          this.emitter.emit('flow-ready');
          successCallback(flow.payment_options.map(p => p.payment_method));
        } else {
          this.emitter.emit('flow-ready');
          successCallback(flow.payment_options.map(p => p.payment_method));
        }
      }, (error: string) => failCallback && failCallback(error));
    }, (error: string) => failCallback && failCallback(error));
  }

  public load(paymentMethod: string, elementSelector: string, config: LoadPaymentConfigInterface): void {
    console.log('PaymentWidget.load()', paymentMethod); // TODO Remove logs
    if (this.isLoadingPayment) {
      console.error('Payment is already loading!');
      config && config.onError('Payment is already loading!');
      return;
    }
    this.isLoadingPayment = true;
    this.unloadLast();
    this.getLoadedFlow((flow: FlowInterface, envJson: EnvironmentConfigInterface) => {
      const payment = flow.payment_options.find(f => f.payment_method === paymentMethod);
      if (!payment) {
        console.error('Payment not found in list!');
        config && config.onError('Payment method not found in list!');
        this.isLoadingPayment = false;
        // tslint:disable
        return;
      }
      const ce = paymentCustomElements[payment.payment_method];
      if (!ce) {
        config && config.onError('Payment method not implemented!');
        this.isLoadingPayment = false;
        // tslint:disable
        return;
      }
      this.choosePayment(payment.id, flow, (flow: FlowInterface) => {
        if (this.isAddressFilled(flow.billing_address || {})) {
          this.loadPaymentMicro(flow, elementSelector, envJson, ce, config);
        } else {
          this.loadAddressMicro(flow, elementSelector, envJson, ce, config);
        }
      }, (error: string) => {
        config && config.onError(error);
        this.isLoadingPayment = false;
      });
    });
  }

  public submit(): void {
    if (!this.isPatchingFlow) {
      if (this.customElement) {
        this.customElement.setAttribute('submit', JSON.stringify({_timestamp: +new Date()}));
      } else {
        console.error('Cant submit because element already removed!');
      }
    }
  }

  public unloadLast(): void {
    if (this.customElement) {
      // this.customElement.remove() doesn't work for IE!
      if (this.customElement.parentNode) {
        this.customElement.parentNode.removeChild(this.customElement);
      }
      this.customElement = null;
    }
  }

  private loadAddressMicro(
    flow: FlowInterface, elementSelector: string, envJson: EnvironmentConfigInterface,
    ce: PaymentCustomElementInterface, config: LoadPaymentConfigInterface
  ): void {
    this.loadPayEverStyles(envJson);
    const customElement = document.createElement('checkout-address-edit');
    customElement.setAttribute('initialaddress', JSON.stringify(flow.billing_address));
    customElement.setAttribute('noshippingaddress', 'true');
    customElement.setAttribute('isonlybilling', 'true');
    customElement.setAttribute('isfilledfieldsreadonly', 'true');
    customElement.addEventListener('submitted', event => {
      console.log('BILLING ADDRESS EVENT', event);
    });
    // TODO serviceReady and loading events

    this.loadScript(envJson.frontend['checkoutWrapper'] + '/checkout-sections/micro.js', () => {
      const bySelector = document.querySelector(elementSelector);
      if (bySelector) {
        bySelector.appendChild(customElement);
        this.customElement = customElement;
        config.onReady && config.onReady();
      } else {
        config.onError && config.onError('Cant find element on page: ' + elementSelector);
      }
      this.isLoadingPayment = false;
    }, error => {
      config.onError && config.onError(error);
      this.isLoadingPayment = false;
    });
  }

  private loadPaymentMicro(
    flow: FlowInterface, elementSelector: string, envJson: EnvironmentConfigInterface,
    ce: PaymentCustomElementInterface, config: LoadPaymentConfigInterface
  ): void {
    console.log('PayeverPaymentWidgetLoader.loadPaymentMicro()', flow, elementSelector); // TODO Remove log
    this.loadPayEverStyles(envJson);
    const customElement = document.createElement(ce.ceElem);
    customElement.setAttribute('flow', JSON.stringify(flow));
    customElement.setAttribute('absoluterooturl', String(this.baseUrl));
    customElement.setAttribute('showsubmitbutton', config.showSubmitButton ? 'true' : 'false');
    customElement.addEventListener('submitted', (event: any) => {
      if (event && event.detail && event.detail.payload !== undefined) {
        // event.detail.payload();
        config.onSubmit && config.onSubmit(() => event.detail.payload());
      } else {
        console.error('Callback func missing in event.detail.payload!');
      }
    });
    const status: StatusInterface = {};
    customElement.addEventListener('loading', (event: any) => {
      if (event && event.detail && event.detail.payload !== undefined) {
        status.loading = status.disabled = event.detail.payload;
        config.onStatus && config.onStatus(status);
      }
    });
    customElement.addEventListener('buttonText', (event: any) => {
      if (event && event.detail && event.detail.payload !== undefined) {
        status.buttonText = event.detail.payload;
        config.onStatus && config.onStatus(status);
      }
    });
    console.log('PayeverPaymentWidgetLoader.loadPaymentMicro() 2'); // TODO Remove log
    this.loadScript(envJson.frontend[ce.envKey] + '/micro.js', () => {
      console.log('PayeverPaymentWidgetLoader.loadPaymentMicro().loadScript()', ce.envKey); // TODO Remove log
      const bySelector = document.querySelector(elementSelector);
      if (bySelector) {
        console.log('PayeverPaymentWidgetLoader.loadPaymentMicro().loadScript().bySelector'); // TODO Remove log
        bySelector.appendChild(customElement);
        this.customElement = customElement;
        config.onReady && config.onReady();
      } else {
        config.onError && config.onError('Cant find element on page: ' + elementSelector);
      }
      this.isLoadingPayment = false;
    }, error => {
      config.onError && config.onError(error);
      this.isLoadingPayment = false;
    });
  }

  private isAddressFilled(address: AddressInterface): boolean {
    // Address can have empty 'id' for one case - when address is invalid (but was prefilled at store)
    return true || Boolean(address && address.id && address.email && address.salutation && address.first_name && address.last_name &&
      address.country && address.city && address.street && address.zip_code);
  }

  private loadPolyfills(envJson: EnvironmentConfigInterface): void {
    this.loadScript(envJson.custom['cdn'] + '/js/polyfills.js', () => {
      this.emitter.emit('polyfills-loaded');
      this.isPolyfillsLoaded = true;
    }, error => {
      console.error('Cant load pe polyfills!', error);
    });
  }

  private getLoadedFlow(callback: (flow: FlowInterface, envJson: EnvironmentConfigInterface) => void): void {
    if (this.flow && this.envJson) {
      callback(this.flow, this.envJson);
    } else {
      this.emitter.once('flow-ready', () => {
        if (this.flow && this.envJson) {
          const envJson = this.envJson;
          if (this.isPolyfillsLoaded) {
            callback(this.flow as FlowInterface, envJson);
          } else {
            this.emitter.once('polyfills-loaded', () => {
              callback(this.flow as FlowInterface, envJson);
            });
          }
        }
      });
    }
  }

  private choosePayment(
    paymentId: number, flow: FlowInterface,
    successCallback: (flow: FlowInterface) => void, failCallback: (data: string) => void
  ): void {
    if (String(flow.payment_option_id) === String(paymentId)) {
      successCallback(flow);
    } else {
      this.patchFlow({ payment_option_id: String(paymentId) }, successCallback, failCallback);
    }
  }

  private createFlow(envJson: EnvironmentConfigInterface, successCallback: (flow: FlowInterface) => void, failCallback: (data: string) => void) {
    this.request(
      `${envJson.backend.checkout}/api/widget-flow/${this.apiCallId}`,
      // `https://checkout-php.test.devpayever.com/api/rest/v3/checkout/flow`,
      'POST',
      false,
      {}, // {amount: 3100, channel_set_id: '47b36169-0584-471b-9c02-d63ddaa9bd9e'},
      (flow: FlowInterface) => {
        successCallback(flow);
      }, (error: string) => {
        failCallback && failCallback(error);
      },
    );
  }

  private loadEnvJson(successCallback: (data: EnvironmentConfigInterface) => void, failCallback: (data: string) => void): void {
    if (sessionStorage.getItem('pe_env') && !!(sessionStorage.getItem('pe_env') || '').length) {
      const envData: EnvironmentConfigInterface = JSON.parse(sessionStorage.getItem('pe_env') || '');
      successCallback(envData);
    } else {
      this.request(`${this.baseUrl}/env.json`, 'GET', false, null, (envData: EnvironmentConfigInterface) => {
        console.log('envData', envData); // TODO Remove log
        sessionStorage.setItem('pe_env', JSON.stringify(envData as EnvironmentConfigInterface));
        successCallback(envData);
      }, (error: string) => {
        failCallback && failCallback(error);
      });
    }
  }

  private loadPayEverStyles(envJson: EnvironmentConfigInterface): void {
    const url = `${envJson.frontend.checkoutWrapper}/lazy-styles.css`;
    if (!document.querySelector(`link[href="${url}"]`)) {
      const style = document.createElement('link');
      style.setAttribute('rel', 'stylesheet');
      style.setAttribute('href', url);
      document.getElementsByTagName('body')[0].appendChild(style);
    }
  }

  patchFlow(data: FlowInterface, successCallback: (flow: FlowInterface) => void, failCallback: (data: string) => void): void {
    if (!this.envJson || !this.flow) {
      failCallback && failCallback('Flow doesnt exists or not loaded');
      return;
    }
    if (data.billing_address) {
      // Small hack for address
      if (!Object.assign) {
        console.error('Object.assign() doesnt exists!');
      } else {
        const address: AddressInterface = {};
        Object.assign(address, this.flow.billing_address, data.billing_address);
        data.billing_address = address;
      }
    }
    this.isPatchingFlow = true;
    this.request(
      `${this.envJson.backend.payments}/api/rest/v3/checkout/flow/${this.flow.id}`,
      'PATCH',
      true,
      data,
      (flow: FlowInterface) => {
        this.flow = flow;
        this.isPatchingFlow = false;
        if (this.customElement) {
          this.customElement.setAttribute('flow', JSON.stringify(flow));
        }
        successCallback(flow);
      }, (error: string) => {
        this.isPatchingFlow = false;
        failCallback && failCallback(error);
        this.isLoadingPayment = false;
      },
    );
  }

  private loadScript(url: string, successCallback: () => void, failCallback: (data: string) => void): void {
    if (this.loadedScripts[url]) {
      successCallback();
    }
    else {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.onload = () => {
        this.loadedScripts[url] = true;
        successCallback();
      };
      script.src = url;
      script.onerror = (error) => {
        failCallback && failCallback(error.toString());
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

  private request(path: string, method: 'GET' | 'POST' | 'PATCH', withToken: boolean, body: any, successCallback: (data: any) => void, failCallback: (data: string) => void): void {
    const xhr = new XMLHttpRequest();
    xhr.open(method, path, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (withToken && this.guestToken) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + this.guestToken);
    }
    xhr.withCredentials = true;
    // xhr.addEventListener('load', () => {
    //   loadCallback(xhr.response);
    // });
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (this.isStatus200(xhr.status)) {
          let parsed = xhr.responseType === '' || xhr.responseType === 'text' ? JSON.parse(xhr.responseText) : xhr.response;
          if (typeof parsed === 'string') {
            // For IE prev code is not parsed
            parsed = JSON.parse(parsed);
          }
          if (parsed.guest_token) {
            this.guestToken = parsed.guest_token;
            localStorage.setItem('pe_guest_token', parsed.guest_token);
          }
          successCallback(parsed);
        }
        //else if (String(xhr.status) !== '0') { // 0 is called when browser cancels OPTIONS request
        //  failCallback && failCallback(xhr.statusText);
        //}
      }
    };
    xhr.onerror = () => {
      failCallback && failCallback(xhr.statusText);
    };
    try {
      xhr.send(body ? JSON.stringify(body) : null);
    } catch (error) {
      failCallback && failCallback(error.toString());
    }
  }

  private isStatus200(status: any): boolean {
    return String(status).length === 3 && String(status).substr(0, 1) === '2';
  }

  private getCookie(name: string): string {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}

if (!(window as any).PayeverPaymentWidgetLoader) {
  (window as any).PayeverPaymentWidgetLoader = new PayeverPaymentWidgetLoader();
}
if ((window as any).onPayeverPaymentWidgetLoaderReady && !(window as any).onPayeverPaymentWidgetLoaderReadyTriggered) {
  (window as any).onPayeverPaymentWidgetLoaderReadyTriggered = true;
  (window as any).onPayeverPaymentWidgetLoaderReady();
}
