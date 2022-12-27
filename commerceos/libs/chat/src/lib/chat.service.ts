import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { PeChatMessage } from '@pe/shared/chat';

@Injectable({ providedIn:'root' })
export class ChatScrollService {
 scrollToMessage$ = new Subject<PeChatMessage>();
 scrollChange$ = new Subject<void>();
 setInputItems$ = new Subject<PeChatMessage[]>();
}
