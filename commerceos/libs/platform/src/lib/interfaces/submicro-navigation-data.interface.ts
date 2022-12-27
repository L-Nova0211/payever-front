import { Params } from '@angular/router';

export interface SubmicroNavigationDataInterface {
  rootMicro: string;
  submicro: string;
  getParams?: Params;
  data?: any;
}
