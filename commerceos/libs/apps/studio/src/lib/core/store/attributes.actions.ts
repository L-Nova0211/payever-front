import { PeCreateUserAttributeBody } from '../interfaces';

export class InitLoadAttributes {
  static readonly type = '[Attributes/API] Load Attributes';
  constructor(public businessId: string) {}
}

export class CreateUserAttribute {
  static readonly type = '[Attributes/API] Create Attribute';
  constructor(public businessId: string, public payload: PeCreateUserAttributeBody) {}
}

export class UpdateUserAttribute {
  static readonly type = '[Attributes/API] Update Attribute';
  constructor(public businessId: string, public payload: PeCreateUserAttributeBody, public id: string) {}
}
