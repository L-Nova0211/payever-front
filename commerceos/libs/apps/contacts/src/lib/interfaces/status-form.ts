import { AddStatusField } from '../public-api';

export interface ContactStatusForm {
    action: ContactStatusAction,
    value?: AddStatusField
}

export enum ContactStatusAction {
    Create = 'add',
    Edit = 'edit'
}