import { PebContext, PebElementDef, PebLanguage, PebScreen, PebStylesheet } from '@pe/builder-core';

export interface PebPagePreviewData {
  element: PebElementDef;
  stylesheet: PebStylesheet;
  context: PebContext;
  screen: PebScreen;
  locale: PebLanguage;
  scale: number;
}
