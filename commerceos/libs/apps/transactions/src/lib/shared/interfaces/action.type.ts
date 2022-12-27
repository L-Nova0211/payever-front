export enum ActionTypeEnum {
  Authorize = 'authorize',
  ApplicationUpdated = 'application_updated',
  ChangeAmount = 'changeamount',
  Cancel = 'cancel',
  Capture = 'capture',
  Change_Amount = 'change_amount',
  EditReference = 'edit_reference',
  CreditAnswer = 'credit_answer',
  UpdateStatus = 'update_status',
  Edit = 'edit',
  EditDelivery = 'edit_delivery',
  Paid = 'paid',
  Return =  'return',
  Refund = 'refund',
  ShippingGoods = 'shipping_goods',
  SendSigningLink = 'send_signing_link',
  StatusChangedOld = 'statuschanged', // TODO: remove later
  StatusChanged = 'status_changed',
  Update = 'update',
  Upload = 'upload',
  Verify = 'verify',
  Void = 'void',
  DownloadShippingSlip = 'download_shipping_slip',
  DownloadShippingLabel = 'download_shipping_label',
  DownloadReturnLabel = 'download_return_label',
  ProcessShippingOrder = 'process_shipping_order',
  ResendShippingOrderTemplate = 'resend_shipping_order_template',
  ContractSigned = 'contract_signed',
  ContractDownloaded = 'contract_downloaded',
  PSPStatusChanged = 'psp_status_changed',
  SignatureWithdrawn = 'signature_withdrawn',
  DownloadContract = 'download_contract',
  MarkPaid = 'mark_paid'
};


export enum CaptureTypeEnum {
  Partial = 'partial',
  Items = 'items'
};
