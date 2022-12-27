import { MicroAppInterface } from '@pe/common';


export interface AllowedAclsInterface {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface AppInterface extends MicroAppInterface {
  allowedAcls: AllowedAclsInterface;
}
