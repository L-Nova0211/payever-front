export interface AppAclFormInterface {
  id: string;
  code: string;
  full_access: boolean;
  creating?: boolean;
  reading?: boolean;
  editing?: boolean;
  deleting?: boolean;
}
