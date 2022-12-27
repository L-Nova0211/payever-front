import { Observable } from 'rxjs';

export abstract class PeInvoiceApi {

  abstract getInvoiceList(): Observable<any[]>;

  abstract getInvoiceById(invoiceId: string): Observable<any>;

  abstract getSingleInvoice(invoiceId: string): Observable<any>;

  abstract getInvoiceHistory(invoiceId: string): Observable<any>;

  abstract createInvoice(body: any): Observable<any>;

  abstract updateInvoice(invoiceId: string, body: any): Observable<any>;

  abstract deleteInvoice(invoiceId: any): Observable<any>;

  abstract deliverInvoice(invoiceId: any): Observable<any>;

  abstract getEmailSettings(): Observable<any>;

  abstract updateEmailSettings(payload:any): Observable<any>;

  abstract getReminder(): Observable<any>;

  abstract setReminder(frequencyDay): Observable<any>;

  abstract deleteReminder(): Observable<any>;

  abstract duplicateInvoice(invoiceId: string): Observable<any>;

  abstract copyInvoice(invoiceIds: string[], targetFolderId: string): Observable<any>;
}
