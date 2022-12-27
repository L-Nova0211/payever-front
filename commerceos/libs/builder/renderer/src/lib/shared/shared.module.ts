import { NgModule } from '@angular/core';

import { TextMaskModule } from 'angular2-text-mask';

import { CurrencyFormatterPipe } from './pipes/currency-formatter.pipe';
import { CurrencySignPipe } from './pipes/currency-sign.pipe';
import { PriceWithCurrencyPipe } from './pipes/price-with-currency.pipe';
import { PebRendererTranslatePipe } from './pipes/renderer-translate.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { PebRendererChildrenSlot } from './slots/children.slot';
import { PebRendererGridCellSlot } from './slots/grid-cell.slot';

const pipes = [
  SafeHtmlPipe,
  SafeUrlPipe,
  CurrencySignPipe,
  CurrencyFormatterPipe,
  PebRendererTranslatePipe,
  PriceWithCurrencyPipe,
];

@NgModule({
  declarations: [
    PebRendererChildrenSlot,
    PebRendererGridCellSlot,
    ...pipes,
  ],
  providers: [
    PebRendererTranslatePipe,
    PriceWithCurrencyPipe,
    CurrencySignPipe,
  ],
  exports: [
    PebRendererChildrenSlot,
    PebRendererGridCellSlot,
    TextMaskModule,
    ...pipes,
  ],
})
export class PebRendererSharedModule {}
