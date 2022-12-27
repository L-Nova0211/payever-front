import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';

import { PickerBaseDirective } from '../../../misc/classes/picker-base.class';
import { LanguageInterface } from '../../../shared/interfaces/editor.interface';
import { LanguageService } from '../../services/language.service';
;

@Component({
  selector: 'pe-language-picker',
  templateUrl: './language-picker.component.html',
  styleUrls: ['./language-picker.component.scss'],
})

export class LanguagePickerComponent extends PickerBaseDirective implements OnInit {
  @ViewChild('languageList', { static: true }) set languageListRef(content: ElementRef<HTMLElement>) {
    setTimeout(() => {
      content.nativeElement.scrollTo({ top: this.languageService.selectedIndex * 40 });
    })
  }

  languages: LanguageInterface[] = [];
  selected: LanguageInterface = null;

  constructor(
    private languageService: LanguageService,
    protected injector: Injector,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.languages = this.route.snapshot.parent.data.languages;
    this.selected = this.languageService.language;
  }

  trackByCode(i: number, item: LanguageInterface): string {
    return item.code;
  }


  onSubmit(): void {
    this.languageService.saved$.next(this.selected);
    this.closePicker();
  }

  onSelect(item: LanguageInterface):void {
    this.selected = item;
  }
}
