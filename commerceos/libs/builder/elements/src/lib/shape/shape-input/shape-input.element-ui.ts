import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PebIntegrationData, PEB_DEFAULT_FONT_SIZE, PEB_DEFAULT_FONT_COLOR } from '@pe/builder-core';
import { PebAbstractStyledElement } from '@pe/builder-renderer';

@Component({
  selector: 'peb-shape-input-element-ui',
  template: `
    <div class="shape-input__wrapper" [ngStyle]="mappedStyles.wrapper">
      <ng-container *ngIf="options.interactions">
        <input
          #inputRef
          [type]="type"
          [ngStyle]="mappedStyles.inputSpan"
          [attr.placeholder]="integrationLink?.title | rendererTranslate:options"
          [textMask]="mask"
          (input)="writeValue(inputRef.value)"
          (blur)="onTouched()"
          autocomplete="off"
          class="shape-input__input"
        />
      </ng-container>

      <ng-container *ngIf="!options.interactions">
        <span
          class="shape-input__input"
          [ngStyle]="mappedStyles.inputSpan"
        >
          {{integrationLink?.title | rendererTranslate:options}}
        </span>
      </ng-container>

    </div>
  `,
  styleUrls: ['./shape-input.element-ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PebShapeInputElementUi,
      multi: true,
    },
  ],
})
export class PebShapeInputElementUi extends PebAbstractStyledElement implements ControlValueAccessor, OnInit {

  @HostBinding('style.pointer-events') pointerEvents = 'none';

  @Input() integrationLink: PebIntegrationData;
  @Input() styles: { [key: string]: any } = {};
  @Input() type = 'text';
  @Input() mask = { mask: false };

  value = '';

  public get mappedStyles() {
    const styles = { ...this.styles };
    const verticalAlignToAlignItems = {
      top: 'flex-start',
      middle: 'center',
      bottom: 'flex-end',
    };

    styles.fontSize = `${styles.fontSize ? styles.fontSize : PEB_DEFAULT_FONT_SIZE}px`;
    styles.textAlign = styles.align ? styles.align : 'left';

    const alignItems = styles.verticalAlign ? verticalAlignToAlignItems[styles.verticalAlign] : 'center';

    return {
      wrapper: {
        padding: '11px',
        alignItems,
      },
      inputSpan: {
        color: PEB_DEFAULT_FONT_COLOR,
        ...styles,
      },
    };
  }

  ngOnInit() {
    this.pointerEvents = this.options.readOnly ? 'auto' : 'none';
  }

  private onChange = (value: any) => { };
  private onTouched = () => { };

  writeValue(obj: string): void {
    this.value = obj;
    this.onChange(obj);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }
}
