import { InfoBoxSettingsInFormInterface } from '@pe/forms';

import { PeQrPrintFileType, PeQrPrintFormData, PeQrPrintOperation } from './qr-print.interface';

export class QrPrintThirdPartyFormMock {

  constructor(private qrUrl: string) {
  }

  private generateQrImageSrc(
    formData: PeQrPrintFormData,
    fileType: PeQrPrintFileType | string = formData.type,
  ): string {
    const qrImageSrcParams = new URLSearchParams();
    qrImageSrcParams.set('type', `${formData.type}`);
    qrImageSrcParams.set('url', formData.url);

    return `${this.qrUrl}/api/download/${fileType}?${qrImageSrcParams.toString()}`;
  }

  generateQrPrintForm(
    formData: PeQrPrintFormData,
    qrPrintOperation: PeQrPrintOperation = null,
  ): InfoBoxSettingsInFormInterface {
    const qrImageSrc = this.generateQrImageSrc(formData);

    return {
      form: {
        contentType: 'accordion',
        title: 'QR',
        type: 'info-box',
        triggerPrintUrl: qrPrintOperation === PeQrPrintOperation.Print ?
          this.generateQrImageSrc(formData, PeQrPrintFileType.Png) : undefined,
        triggerDownloadUrl: qrPrintOperation === PeQrPrintOperation.Download ? qrImageSrc : undefined,
        triggerDownloadFileName: 'qr',
        content: {
          accordion: [
            {
              title: 'QR',
              data: [[{
                type: 'image',
                value: this.generateQrImageSrc(formData, PeQrPrintFileType.Png),
                classes: 'width-50-percent',
              }]],
            },
            {
              title: 'Options',
              data: [],
              operations: [
                // {
                //   action: PeQrPrintOperation.Preview,
                //   text: 'Preview',
                //   request: {
                //     url: 'https://qr-backend.test.devpayever.com/api/form/preview',
                //     method: 'post',
                //   },
                // },
                {
                  action: PeQrPrintOperation.Download,
                  text: 'Download',
                  request: {
                    url: 'https://qr-backend.test.devpayever.com/api/form/download',
                    method: 'post',
                  },
                },
                {
                  action: PeQrPrintOperation.Print,
                  text: 'Print',
                  request: {
                    url: 'https://qr-backend.test.devpayever.com/api/form/print',
                    method: 'post',
                  },
                },
              ] as any,
              fieldset: [
                {
                  name: 'url',
                  type: 'hidden',
                  fieldSettings: { required: true },
                },
                {
                  name: 'type',
                  type: 'select',
                  fieldSettings: {
                    classList: 'col-xs-12',
                    label: 'Type',
                    required: true,
                  },
                  selectSettings: {
                    panelClass: 'mat-select-dark',
                    options: [
                      { label: 'svg', value: PeQrPrintFileType.Svg },
                      { label: 'png', value: PeQrPrintFileType.Png },
                      { label: 'pdf', value: PeQrPrintFileType.Pdf },
                    ],
                    placeholder: 'tpm.communications.qr.type',
                  },
                },
              ],
              fieldsetData: formData,
            },
          ],
        },
      },
    } as any;
  }
}
