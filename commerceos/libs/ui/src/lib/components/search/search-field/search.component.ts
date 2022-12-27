import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService } from '@pe/common';

import { PeSearchOptionInterface } from '../search-option.interface';

@Component({
  selector: 'pe-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeSearchComponent implements OnChanges {

  @Input() public errorMessage = 'Search';
  @Input() public isFieldInvalid = false;
  @Input() public label = 'Search';
  @Input() public loading = false;
  @Input() public placeholder?: string = 'Search';

  @Input() private items: PeSearchOptionInterface[] = [];

  @Output() filterChanged = new EventEmitter<string>();
  @Output() selected = new EventEmitter<PeSearchOptionInterface>();

  @ViewChild('input', { static: true }) elementRef: ElementRef;

  public focused = false;
  public formControl: FormControl = new FormControl('');
  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  private readonly refreshValue$ = new Subject<any>();
  private readonly filterChanged$ = this.formControl
    .valueChanges
    .pipe(
      tap(value => {
        this.filterChanged.emit(value);
      }));
  public readonly filteredItems$ = merge(
    this.filterChanged$,
    this.refreshValue$,
  ).pipe(
    startWith(''),
    map(value => this.filter(value)));

  constructor(private envService: EnvService) { }

  ngOnChanges(changes: SimpleChanges): void {
    changes.items && this.refreshValue$.next(this.formControl.value);
  }

  private filter(value: string | any): PeSearchOptionInterface[] {
    const normalizeValue = (value: string) => value?.toLowerCase().replace(/\s/g, '') ?? '';
    const filterValue: string = normalizeValue(value.title ?? value);

    return this.items.filter(item => normalizeValue(item.title).includes(filterValue));
  }

  public setFocus(): void {
    this.focused = true;
    this.filterChanged.emit(null);
  }

  public setBlur(): void {
    this.focused = false;
  }

  public optionSelected(item: PeSearchOptionInterface): void {
    this.elementRef.nativeElement.blur();
    this.formControl.patchValue('');
    this.selected.emit(item);
  }

  public readonly isIconImage = (icon: string = ''): boolean => icon.includes('/');
  public readonly isIconXlink = (icon: string = ''): boolean => icon[0] === '#';
  public readonly trackOption = (index: number, option: PeSearchOptionInterface) => option;
}
