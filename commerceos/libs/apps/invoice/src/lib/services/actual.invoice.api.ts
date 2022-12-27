import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvService } from '@pe/common';

import { PEB_INVOICE_API_PATH } from '../constants';

import { PeInvoiceApi } from './abstract.invoice.api';

@Injectable()
export class ActualPeInvoiceApi implements PeInvoiceApi {

    constructor(
        @Inject(PEB_INVOICE_API_PATH) private invoiceApiPath: string,
        private envService: EnvService,
        private http: HttpClient,
    ) {
    }

    get businessId() {
        return this.envService.businessId;
    }

    getInvoiceList(): Observable<any> {
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices`;

        return this.http.get<any>(endpoint);
    }

    getInvoiceById(invoiceId: string): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/${invoiceId}`;

        return this.http.get<any>(endpoint);
    }

    getSingleInvoice(invoiceId: string): Observable<any> {
      const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/${invoiceId}`;

      return this.http.get<any>(endpoint);
    }

    getInvoiceHistory(invoiceId: string): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices${invoiceId}/history`;

        return this.http.get<any>(endpoint);
    }

    createInvoice(body: any): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices`;

        return this.http.post<any>(endpoint,body);
    }

    updateInvoice(invoiceId: string, body: any): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/${invoiceId}`;

        return this.http.put<any>(endpoint,body);
    }

    deleteInvoice(invoiceId: any): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/${invoiceId}`;

        return this.http.delete<any>(endpoint);
    }

    invoiceDownload(invoiceId: string): Observable<any>{
        const endpoint 
            = `${this.invoiceApiPath}/business/${this.businessId}/invoices/${invoiceId}/pdf`;

        return this.http.get<any>(endpoint);
    }

    invoicePrint(invoiceId: string): Observable<any>{
        const httpOptions = {
            responseType: 'text',
          };

        const endpoint 
            = `${this.invoiceApiPath}/business/${this.businessId}/invoices/${invoiceId}/html`;

        return this.http.get(endpoint, httpOptions as any);
    }

    deliverInvoice(invoiceId: any): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/${invoiceId}/deliver`;

        return this.http.post<any>(endpoint,{});
    }

    getEmailSettings(): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/email-settings`;

        return this.http.get<any>(endpoint);
    }

    updateEmailSettings(payload: any): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/email-settings`;

        return this.http.patch<any>(endpoint, payload);
    }

    getReminder(): Observable<any> {
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/reminder`;

        return this.http.get<any>(endpoint);
    };

    setReminder(frequencyDay): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/reminder`;

        return this.http.patch<any>(endpoint,{ frequencyDay });
    }

    deleteReminder(): Observable<any>{
        const endpoint = `${this.invoiceApiPath}/business/${this.businessId}/invoices/reminder`;

        return this.http.delete<any>(endpoint);
    }

    duplicateInvoice(invoiceId: string): Observable<any> {
      return this.http.post<any>(
        `${this.invoiceApiPath}/business/${this.businessId}`
        + `/application/${this.businessId}/theme/${invoiceId}/duplicate`,
        {},
      );
    }

    copyInvoice(invoiceIds: string[], targetFolderId: string): Observable<any> {
      return this.http.post<any>(
        `${this.invoiceApiPath}/business/${this.businessId}/invoices/copy`,
        { invoiceIds, targetFolderId },
      );
    }
}