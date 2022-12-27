import { Observable } from 'rxjs';

import { NavbarControlInterface } from '../interfaces';

export type NavbarControl = NavbarControlInterface | Observable<NavbarControlInterface>;
