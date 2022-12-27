export interface AuthTokenInterface {
  id: string;
  businessId: string;
  secret: string;
  createdAt: string;
  updatedAt: string;
  scopes: string[];
  grants: string[];
  accessTokenLifetime: number;
  refreshTokenLifetime: number;
  isActive: boolean;
  name: string;
  redirectUris: string;
  user: {
    roles: any[],
    _id: string,
    email: string,
    first_name: string,
    last_name: string,
    password: string,
    createdAt: string,
    updatedAt: string
  };
}
