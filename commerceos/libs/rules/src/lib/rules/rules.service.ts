import { Injectable } from '@angular/core';
import { EMPTY, Observable, Subject } from 'rxjs';

import { AppThemeEnum } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { OverlayHeaderConfig } from '@pe/overlay-widget/components/overlay-widget/interfaces';


import { Headings } from '../models/rule-confirm-heading.model';
import { RuleOverlayData } from '../models/rules.model';

import { RulesComponent } from './rules.component';

@Injectable({
  providedIn: 'any',
})
export class RulesService {
  overlayRef: PeOverlayRef;
  constructor(
    private overlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private confirmScreenService: ConfirmScreenService
  ) {}

  private headings: Headings = {
    title: this.translateService.translate('rules.exit.title'),
    subtitle: this.translateService.translate('rules.exit.subtitle'),
    confirmBtnText: this.translateService.translate('rules.yes'),
    declineBtnText: this.translateService.translate('rules.no'),
  }


  public show(onSaveSubject$: Subject<any>, data: RuleOverlayData, theme: AppThemeEnum) {
    data.theme = data.theme || (theme as AppThemeEnum);
    const headerConfig: OverlayHeaderConfig = {
      theme,
      onSaveSubject$,
      title: this.translateService.translate('rules.name'),
      backBtnTitle: this.translateService.translate('rules.cancel'),
      backBtnCallback: () => {
        this.showConfirmDialog(this.headings, onSaveSubject$);
      },
      doneBtnTitle: this.translateService.translate('rules.done'),
      doneBtnCallback: () => {
        onSaveSubject$.next(true);
        this.overlayRef.close();
      },
      onSave$: onSaveSubject$.asObservable(),
    } as any;
    this.overlayRef = this.overlayWidgetService.open({
      data,
      headerConfig,
      panelClass: 'overlay-panel',
      component: RulesComponent,
      backdropClick: () => {
        this.showConfirmDialog(this.headings);

        return EMPTY;
      },
    });
  }

  private showConfirmDialog(headings: Headings, saveSubject$?) {
    const confirmObservable: Observable<boolean> = this.confirmScreenService.show(headings, true);
    confirmObservable.subscribe(confirmation => {
      if (confirmation) {
        saveSubject$?.next(false);
        this.overlayRef.close();
      }
    })
  }
}
