import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SelectGroupComponent } from './select-group';
import { SelectOptionComponent } from './select-option';
import { OverlayComponent, SelectOverlayRef } from './select-overlay';
import { SelectVirtualOptionsComponent } from './select-virtual-option';
import { SelectService } from './select.service';

@Component({
  selector: 'peb-select',
  templateUrl: './select.html',
  styleUrls: ['./select.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SelectService],
  animations: [
    trigger('isFocusedLabel', [
      state(
        'true',
        style({
          // height: '36px',
          // 'line-height': '36px',
          // 'font-size': '13px',
          // 'font-weight': 500,
          // transform: 'translate3d(0, 0, 0)',
          // '-webkit-backface-visibility': 'hidden',
          // '-webkit-perspective': 1000,
          transform: 'scale(1)',
        }),
      ),
      state(
        'false',
        style({
          // height: '16px',
          // 'line-height': '16px',
          // 'font-size': '11px',
          // 'font-weight': 500,
          // transform: 'translate3d(0, 0, 0)',
          // '-webkit-backface-visibility': 'hidden',
          // '-webkit-perspective': 1000,
          transform: 'scale(.75)',
        }),
      ),
      transition('true => false', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
      transition('false => true', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
    ]),
    trigger('isFocusedText', [
      state(
        'true',
        style({
          height: 0,
        }),
      ),
      state(
        'false',
        style({
          // height: '16px',
        }),
      ),
      transition('true => false', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
      transition('false => true', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
    ]),
  ],
})
export class PebSelectComponent implements AfterContentInit {
  constructor(private selectService: SelectService, private elRef: ElementRef, private cdr: ChangeDetectorRef) {
    this.selectService.register(this);
  }

  /** Selected item */
  selected: any;
  preselected: any;

  /** Whether select is focused */
  isFocused = false;

  /** Sets select label */
  @Input() public label: string;
  /** Sets select placeholder */
  @Input() public placeholder?: string;
  /** Sets select required */
  @Input() public required = false;
  /** Sets select disabled */
  @Input() public disabled = false;
  /** Sets select type */
  @Input() public selectType;
  /** Whether is multiple select */
  @Input() public multiple = false;
  /** Whether select is animated */
  @Input() animated = false;
  /** Whether field is invalid */
  @Input() isFieldInvalid = false;
  /** Sets error message */
  @Input() errorMessage: string;
  @Input() hideArrow: boolean;

  @Input('selected') set setSelected(selected: any) {
    this.preselected = selected;
  }

  selectedChanged$ = new BehaviorSubject<any>(null);

  /** Emits when value changed */
  @Output() readonly changed: EventEmitter<any> = new EventEmitter<any>();

  /** Gets select option components */
  @ContentChildren(SelectOptionComponent)
  public options: QueryList<SelectOptionComponent>;

  /** Gets select group components */
  @ContentChildren(SelectGroupComponent)
  public optionGroup: QueryList<SelectGroupComponent>;

  /** Gets virtual options components */
  @ContentChildren(SelectVirtualOptionsComponent)
  public virtualOption: QueryList<SelectVirtualOptionsComponent>;

  /** Dialog ref */
  dialogRef: SelectOverlayRef;

  /** Selected option */
  public selectedOption: SelectOptionComponent;
  /** Selected options when multiple is true */
  public selectedOptions: SelectOptionComponent[] = [];
  /** Selected options when virtual options is used */
  public selectedVirtualOptions = [];

  /** Displays selected options */
  public displayText: string;

  @ViewChild('input')
  public input: ElementRef;

  @ViewChild(OverlayComponent)
  public dropdown: OverlayComponent;

  ngAfterContentInit() {
    this.selectedChanged$.subscribe((value) => {
      if (value === null) {
        this.displayText = '';
        this.cdr.detectChanges();
      } else {
        if (this.virtualOption.length !== 0) {
          if (this.multiple) {
            if (value) {
              value.forEach((element) => {
                this.selectedVirtualOptions.push(
                  this.virtualOption?.first?.virtualData.find((option) => option.value === element),
                );

                this.displayText = this.selectedVirtualOptions ? this.concatLabels(true) : '';
                this.cdr.detectChanges();
              });
            }
          } else {
            this.selected = value.value;
            this.displayText = this.virtualOption?.first?.virtualData.find((option) => option.value === value)?.label;
            this.cdr.detectChanges();
          }
        } else {
          if (this.multiple) {
            if (value) {
              const setNewValues = [];
              value.forEach((item) => {
                setNewValues.push(this.options.toArray().find((option) => option.value === item));
              });
              this.selectedOptions = setNewValues;
              this.displayText = this.selectedOptions ? this.concatLabels() : '';
              this.cdr.detectChanges();
            }
          } else {
            if (this.optionGroup.toArray().length !== 0) {
              this.optionGroup.toArray().forEach((group, index) => {
                const selected = group.options.toArray().find((option) => option.value === value);

                if (selected) {
                  this.selectedOption = selected;
                }
              });
              this.displayText = this.selectedOption ? this.selectedOption.label : '';
              this.cdr.detectChanges();
            } else {
              this.selectedOption = this.options.toArray().find((option) => option.value === value);
              this.displayText = this.selectedOption ? this.selectedOption.label : '';
              this.cdr.detectChanges();
            }
          }
        }
      }

      this.isFocused = this.displayText.length > 0;
      this.cdr.detectChanges();
    });

    if (this.preselected && this.options) {
      const option = this.options
        .toArray()
        .find((option) => option?.value === this.preselected || option === this.preselected);
      if (option) {
        this.selectOption(option);
      }
    }
  }

  /** Select option handler */
  public selectOption(option: SelectOptionComponent) {
    if (this.multiple) {
      if (!this.selected) {
        this.selected = [];
        this.selected.push(option.value);
        this.selectedOptions.push(option);
        this.displayText = this.selectedOptions ? this.concatLabels() : '';
        this.cdr.detectChanges();
        this.changed.emit(this.selected);

        return;
      }
      if (this.selected.indexOf(option.value) === -1) {
        this.selected.push(option.value);
        this.selectedOptions.push(option);
        this.displayText = this.selectedOptions ? this.concatLabels() : '';
        this.cdr.detectChanges();
        this.changed.emit(this.selected);
      } else {
        this.selected = this.selected.filter((item) => item !== option.value);
        this.selectedOptions = this.selectedOptions.filter((item) => item !== option);
        this.displayText = this.selectedOptions ? this.concatLabels() : '';
        this.cdr.detectChanges();
        this.changed.emit(this.selected);
      }
    } else {
      this.selected = option.value;
      this.selectedOption = option;
      this.displayText = this.selectedOption ? this.selectedOption.label : '';
      this.cdr.detectChanges();
      this.hideDropdown();
      this.changed.emit(this.selected);
    }
  }

  /** Select option handler when virtual options is used */
  public selectVirtualOption(option) {
    if (this.multiple) {
      if (!this.selected) {
        this.selected = [];
        this.selected.push(option.value);
        this.selectedVirtualOptions.push(option);
        this.displayText = this.selectedVirtualOptions ? this.concatLabels(true) : '';
        this.cdr.detectChanges();
        this.changed.emit(this.selected);

        return;
      }
      if (this.selected.indexOf(option.value) === -1) {
        this.selected.push(option.value);
        this.selectedVirtualOptions.push(option);
        this.displayText = this.selectedVirtualOptions ? this.concatLabels(true) : '';
        this.cdr.detectChanges();
        this.changed.emit(this.selected);
      } else {
        this.selected = this.selected.filter((item) => item !== option.value);
        this.selectedVirtualOptions = this.selectedVirtualOptions.filter((item) => item !== option);
        this.displayText = this.selectedVirtualOptions ? this.concatLabels(true) : '';
        this.cdr.detectChanges();
        this.changed.emit(this.selected);
      }
    } else {
      this.selected = option.value;
      this.displayText = option.label;
      this.cdr.detectChanges();
      this.hideDropdown();
      this.changed.emit(this.selected);
    }
  }

  /** Creates string of selected values */
  concatLabels(virtual: boolean = false): string {
    let text = '';
    if (virtual) {
      this.selectedVirtualOptions.forEach((item, index) => {
        if (index === this.selectedVirtualOptions?.length - 1) {
          text = text.concat(item?.label);
        } else {
          text = text.concat(`${item?.label}, `);
        }
      });
    } else {
      this.selectedOptions.forEach((item, index) => {
        if (index === this.selectedOptions?.length - 1) {
          text = text.concat(item?.label);
        } else {
          text = text.concat(`${item?.label}, `);
        }
      });
    }

    return text;
  }

  /** Opens options dropdown */
  public showDropdown() {
    if (!this.disabled) {
      const element = this.elRef.nativeElement as HTMLElement;
      const width = element.getBoundingClientRect().width;
      this.dialogRef = this.dropdown.show(width);
      this.isFocused = true;
      this.cdr.detectChanges();
    }
  }

  /** Closes options dropdown */
  public hideDropdown() {
    this.dialogRef?.close();
    this.isFocused = this.displayText.length > 0;
    this.cdr.detectChanges();
  }

  /** Triggers when dropdown opens */
  isShowing(event) {
    this.isFocused = this.displayText.length > 0;
  }

  public onDropMenuIconClick(event: UIEvent) {
    event.stopPropagation();
    setTimeout(() => {
      this.input.nativeElement.focus();
      this.input.nativeElement.click();
    }, 10);
  }

  /** Whether select is animated */
  shouldAnimate() {
    if (this.animated && this.isFieldInvalid) {
      return false;
    }

    return this.animated && !this.isFocused;
  }
}
