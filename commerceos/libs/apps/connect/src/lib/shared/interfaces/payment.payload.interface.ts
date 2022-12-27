export interface PaymentPayloadInterface {
  application_sent?: boolean;
  documents?: PaymentDocumentPayloadInterface[];
}

export interface PaymentDocumentPayloadInterface {
  type: string;
  name: string;
  blobName: string;
}
