import { SafeHtml } from '@angular/platform-browser';
import { Observable } from 'rxjs';

export interface PeStatisticsSingleSelectedAction {
    label: string;
    shortLabel?: string;
    isLoading$?: Observable<boolean>;
    callback: (selectedId?: string) => void;
}

export interface PeStatisticsItem {
    id?: string;
    _id?: string;
    image?: string;
    title?: string | SafeHtml;
    subtitle?: string;
    description?: string | SafeHtml;
    /** @deprecated Use customFields[0] instead */
    customField1?: string;
    /** @deprecated Use customFields[1] instead */
    customField2?: string;
    /** @deprecated Use customFields[2] instead */
    customField3?: string;
    customFields?: (string | SafeHtml)[];
    selected?: boolean;
    actions?: PeStatisticsSingleSelectedAction[];
    labels?: string[];
}