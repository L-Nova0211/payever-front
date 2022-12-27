import { Injectable } from '@angular/core';

import { TransactionDetailsSections } from '../../shared/enums/transaction.enum';

@Injectable()
export class SectionsService {

  sectionKeys: TransactionDetailsSections[] = Object.keys(TransactionDetailsSections).map(
    (key: string) => TransactionDetailsSections[key],
  );

  activeSection: TransactionDetailsSections = null;
  sectionsWithErrors: string[] = [];

  reset(): void {
    this.activeSection = null;
  }
}
