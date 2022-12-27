import { Injector, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

import { NavigationService } from '../../../../shared/services';

import { BaseComponent } from './base.component';

export abstract class BaseAccordionComponent extends BaseComponent {

  protected navigationService: NavigationService = this.injector.get(NavigationService);

  constructor(injector: Injector) {
    super(injector);
  }

  handleClose(): void {
    this.navigationService.returnBack();
  }

  protected showFirstPanel(panelsList: QueryList<MatExpansionPanel>): void {
    let hasExpanded = false;
    const panels: MatExpansionPanel[] = panelsList['_results'] || [];
    for (let i = 0; i < panels.length; i++) {
      if (panels[i].expanded && !panels[i].disabled) {
        hasExpanded = true;
        break;
      }
    }
    if (!hasExpanded) {
      for (let i = 0; i < panels.length; i++) {
        if (!panels[i].disabled) {
          panels[i].expanded = true;
          break;
        }
      }
    }
  }
}
