import { FieldInput } from './core/input';
import { isValid as isValidIban } from 'iban';
import Inputmask from 'inputmask';

export class FieldInputIban extends FieldInput {

  protected addInputElemToPage(): void {
    super.addInputElemToPage();

    Inputmask({
      mask: 'aa 99 **** **** **** **** **** **** **** ****',
      greedy: false,
      placeholder: ' ',
    }).mask(this.inputElem);
  }

  protected handleOnInput(): void {
    const rawValue = this.inputElem.value;
    const upper = rawValue.toUpperCase();
    if (rawValue !== upper) {
      this.inputElem.value = upper.trim();
    }
    if (this.inputElem.value && !isValidIban(this.inputElem.value)) {
      this.invalid = true;
      this.validationError = 'ng_kit.forms.error.validator.pattern';
    } else {
      this.invalid = false;
      this.validationError = null;
    }
    super.handleOnInput();
  }

  protected cleanupValue(value: any): any {
    return String(value).split(' ').join('');
  }
}

new FieldInputIban();
