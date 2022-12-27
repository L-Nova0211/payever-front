import { Inject, Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { RestUrlInterface } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { PaymentMethodEnum } from '@pe/checkout-wrapper-sdk-types';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { PeUser, UserState } from '@pe/user';

@Injectable({
  providedIn: 'any',
})
export class SettingsService {
  @SelectSnapshot(UserState.user) userData: PeUser;

  constructor(
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    private cosEnvService: CosEnvService,
    private envService: EnvService,
    private authService: PeAuthService
  ) {
  }

  get businessUuid(): string {
    return this.envService.businessId;
  }

  get userId(): string {
    return this.userData._id;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isPersonal(): boolean {
    return this.cosEnvService.isPersonalMode;
  }

  get apiMicroBaseUrl(): string {
    return this.envConfig.backend.transactions;
  }

  get apiMicroShippingUrl(): string {
    return this.envConfig.backend.shipping;
  }

  get apiThirdPartyPaymentsUrl(): string {
    return this.envConfig.thirdParty.payments;
  }

  get checkoutWrapperUrl(): string {
    return this.envConfig.frontend.checkoutWrapper;
  }

  get apiMicroMailerUrl(): string {
    return this.envConfig.backend.mailer;
  }

  get baseUrl() {
    if (this.isPersonal) {
      return ['personal', this.userId, 'transactions', 'list'];
    }

    return ['business', this.envService.businessId, 'transactions', 'list'];
  }

  get apiBusinessUrls(): RestUrlInterface {
    const isAdmin: boolean = this.authService.isAdmin();

    return {
      apiGetListUrl: (businessUuid: string): string => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/list` :
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/list`,
      apiGetColumnsUrl: (businessUuid: string): string => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/settings` :
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/settings`,
      apiGetOrderDetailsUrl: (businessUuid: string, orderUuid: string): string => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/detail/${orderUuid}` :
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/transaction/${orderUuid}/details`,
      apiGetOrderActionsUrl: (businessUuid: string, orderUuid: string): string => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/detail/${orderUuid}` :
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/transaction/${orderUuid}/actions`,
      postActionUrl: (businessUuid: string, transactionUuid: string, action: string) =>
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/${transactionUuid}/action/${action}`,
      apiGetExport: (businessUuid: string): string => `${this.apiMicroBaseUrl}/api/business/${businessUuid}/export`,
      postShippingOrder: (businessUuid: string, shippingOrderId: string): string =>
        `${this.apiMicroShippingUrl}/api/business/${businessUuid}/shipping-orders/${shippingOrderId}`,
      apiRootDocuments: (businessUuid: string): string => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/folders/root-documents` :
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}/root-documents`,
      apiFolderDocuments: (businessUuid: string, folderId: string) => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/folders/folder/${folderId}/documents` :
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}/folder/${folderId}/documents`,
      apiFlatFolders: (businessUuid: string) => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/folders` :
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}`,
      apiFoldersTree: (businessUuid: string) =>
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}/tree`,
      apiPostFolder: (businessUuid: string) =>
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}`,
      apiPatchFolder: (businessUuid: string, folderId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}/folder/${folderId}`,
      apiPatchFolderPosition: (businessUuid: string) =>
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}/update-positions`,
      apiDeleteFolder: (businessUuid: string, folderId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}/folder/${folderId}`,
      apiMoveToFolder: (businessUuid: string, folderId: string, documentId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}/document/${documentId}/move-to-folder/${folderId}`,
      apiMoveToRoot: (businessUuid: string, documentId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/business/${businessUuid}/document/${documentId}/move-to-root`,
    };
  }

  get apiPersonalUrls(): RestUrlInterface {

    return {
      apiGetListUrl: (): string => `${this.apiMicroBaseUrl}/api/user/list`,
      apiGetColumnsUrl: (): string => `${this.apiMicroBaseUrl}/api/user/settings`,
      apiGetOrderDetailsUrl: (orderUuid: string): string => `${this.apiMicroBaseUrl}/api/user/detail/${orderUuid}`,
      apiGetExport: (userId: string): string => `${this.apiMicroBaseUrl}/api/user/${userId}/export`,
      apiRootDocuments: (userId: string): string =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}/root-documents`,
      apiFolderDocuments: (userId: string, folderId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}/folder/${folderId}/documents`,
      apiFlatFolders: (userId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}`,
      apiFoldersTree: (userId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}/tree`,
      apiPostFolder: (userId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}`,
      apiPatchFolder: (userId: string, folderId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}/folder/${folderId}`,
      apiPatchFolderPosition: (userId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}/update-positions`,
      apiDeleteFolder: (userId: string, folderId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}/folder/${folderId}`,
      apiMoveToFolder: (userId: string, folderId: string, documentId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}/document/${documentId}/move-to-folder/${folderId}`,
      apiMoveToRoot: (userId: string, documentId: string) =>
        `${this.apiMicroBaseUrl}/api/folders/user/${userId}/document/${documentId}/move-to-root`,
    };
  }


  get externalUrls(): RestUrlInterface {
    const token: string = encodeURIComponent(this.authService.token);

    return {
      getSantanderCheckStatusUrl: (businessUuid: string, transactionUuid: string) =>
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/${transactionUuid}/update-status`,
      getTransactionDataUrl: (businessUuid: string, transactionUuid: string) =>
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/${transactionUuid}`,
      // TODO: Replace endpoint to node api - checkout-backend
      // getSantanderContractUrl: (id: string) => `${this.apiMicroCheckoutUrl}/santander-de/download-contract/${id}?access_token=${token}`,
      getSantanderPosDeContractUrl: (businessUuid: string, id: string) =>
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/download-contract/${id}`,
      getSantanderFactoringContractUrl: (businessUuid: string, id: string) =>
        `${this.apiThirdPartyPaymentsUrl}/api/download-resource/business/${businessUuid}`
        + `/integration/santander_pos_factoring_de/action/contract?paymentId=${id}&access_token=${token}`,
      getSantanderInvoiceContractUrl: (businessUuid: string, id: string) =>
        `${this.apiThirdPartyPaymentsUrl}/api/download-resource/business/${businessUuid}`
        + `/integration/santander_pos_invoice_de/action/contract?paymentId=${id}&access_token=${token}`,
      // TODO: Replace endpoint to node api - checkout-backend
      // getSantanderDeQr: (firstName: string, lastName: string, referenceNumber: string) => {
      //   return `${this.apiMicroCheckoutUrl}/santander-de/qr?first_name=${firstName}&last_name=${lastName}&number=${referenceNumber}`;
      // },
      getBusinessVatUrl: (slug: string) => `/business/${slug}/vat`,
      getSantanderPosInstallmentEditUrl: (flowId: string) =>
        `${this.checkoutWrapperUrl}/pay/${flowId}?editMode=true&modalWindowMode=true&forceNoCloseButton=true`,
      getShippingActionsUrl: () => `${this.apiMicroShippingUrl}/api/transaction-actions`,
      getMailerActionsUrl: () => `${this.apiMicroMailerUrl}/api/transaction-actions`,
    };
  }

  get contractUrl(): RestUrlInterface {
    return {
      [PaymentMethodEnum.SANTANDER_INSTALLMENT]: (_, id: string) =>
        this.externalUrls.getSantanderContractUrl(id),
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: (businessUuid: string, id: string) =>
        this.externalUrls.getSantanderPosDeContractUrl(businessUuid, id),
      [PaymentMethodEnum.SANTANDER_POS_FACTORING_DE]: (businessUuid: string, id: string) =>
        this.externalUrls.getSantanderFactoringContractUrl(businessUuid, id),
      [PaymentMethodEnum.SANTANDER_POS_INVOICE_DE]: (businessUuid: string, id: string) =>
        this.externalUrls.getSantanderInvoiceContractUrl(businessUuid, id),
    }
  }

  get apiRootDocuments(): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiRootDocuments(this.userId)
      : this.apiBusinessUrls.apiRootDocuments(this.businessUuid);
  }

  get apiFlatFolders(): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiFlatFolders(this.userId)
      : this.apiBusinessUrls.apiFlatFolders(this.businessUuid);
  }

  get apiFoldersTree(): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiFoldersTree(this.userId)
      : this.apiBusinessUrls.apiFoldersTree(this.businessUuid);
  }

  get apiPostFolder(): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiPostFolder(this.userId)
      : this.apiBusinessUrls.apiPostFolder(this.businessUuid);
  }

  get apiPatchFolderPosition(): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiPatchFolderPosition(this.userId)
      : this.apiBusinessUrls.apiPatchFolderPosition(this.businessUuid);
  }

  get apiGetListUrl(): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiGetListUrl()
      : this.apiBusinessUrls.apiGetListUrl(this.businessUuid);
  }

  get apiGetColumnsUrl(): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiGetColumnsUrl()
      : this.apiBusinessUrls.apiGetColumnsUrl(this.businessUuid);
  }

  get apiPutColumnsUrl(): string {
    return this.isPersonal
      ? this.apiBusinessUrls.apiPutPrivateColumnsUrl()
      : this.apiBusinessUrls.apiPutColumnsUrl(this.businessUuid);
  }

  get apiGetExport(): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiGetExport(this.userId)
      : this.apiBusinessUrls.apiGetExport(this.businessUuid);
  }

  getApiGetOrderDetailsUrl(orderUuid: string): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiGetOrderDetailsUrl(orderUuid)
      : this.apiBusinessUrls.apiGetOrderDetailsUrl(this.businessUuid, orderUuid);
  }

  getApiGetOrderActionsUrl(orderUuid: string): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiGetOrderActionsUrl(orderUuid)
      : this.apiBusinessUrls.apiGetOrderActionsUrl(this.businessUuid, orderUuid);
  }

  apiFolderDocuments(folderId: string): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiFolderDocuments(this.userId, folderId)
      : this.apiBusinessUrls.apiFolderDocuments(this.businessUuid, folderId);
  }

  apiPatchFolder(folderId: string): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiPatchFolder(this.userId, folderId)
      : this.apiBusinessUrls.apiPatchFolder(this.businessUuid, folderId);
  }

  apiDeleteFolder(folderId: string): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiDeleteFolder(this.userId, folderId)
      : this.apiBusinessUrls.apiDeleteFolder(this.businessUuid, folderId);
  }

  apiMoveToFolder(folderId: string, documentId: string): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiMoveToFolder(this.userId, documentId)
      : this.apiBusinessUrls.apiMoveToFolder(this.businessUuid, folderId, documentId);
  }

  apiMoveToRoot(documentId: string): string {
    return this.isPersonal
      ? this.apiPersonalUrls.apiMoveToFolder(this.userId, documentId)
      : this.apiBusinessUrls.apiMoveToFolder(this.businessUuid, documentId);
  }
}
