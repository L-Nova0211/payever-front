import { Injectable } from '@angular/core';
import RBush from 'rbush';

import { PeAnchorType } from './anchors';

@Injectable({ providedIn: 'any' })
export class PebAnchorsService  extends RBush<PeAnchorType> {
}
