import { Injectable } from '@angular/core';
import { ApmErrorHandler, ApmService } from '@elastic/apm-rum-angular';

@Injectable()
export class AppErrorhandler extends ApmErrorHandler {
    skipErrorMessageList: string[] = [
        'REASON_EMAIL_BAN_REGISTER',
        'REASON_EMAIL_BAN_LOGIN',
    ];

    constructor(private apmService:ApmService) {
      super(apmService.apm)
    }

    handleError(error:any) {
        if(
            !error
            || error.originalError === 'Validation failed'
            || (error.originalError && error.originalError.status === 403)
            || error === 'Validation failed'
            || error.message === 'Validation failed'
            || this.skipErrorMessageList.includes(error.message)
            || error.status === 403
        ) {
           return;
        }

        super.handleError(error);
    }
}
