import { Observable } from 'rxjs';

export abstract class EnvService {
  abstract businessId$: Observable<string>;
  abstract businessId: string;
  abstract businessData$: Observable<any>;
  abstract businessData: any; // BusinessInterface;
}
