export interface PeBuilderShareCustomAccess {
  id: string;
  theme: string;
  application: string;
  access: PeBuilderShareAccess;
}

export enum PeBuilderShareAccess {
  Editor= 'Editor',
  Viewer = 'Viewer',
}

export function getShareLink(accessId: string, businessId: string, applicationId: string, appType: string): string {
  return `${window.location.origin}/access/${accessId}/business/${businessId}/${appType}/${applicationId}/edit`;
}
