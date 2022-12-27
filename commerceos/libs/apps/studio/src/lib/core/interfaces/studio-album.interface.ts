export interface PeStudioAlbum {
  categoryId: string;
  ancestors: any[];
  _id: string;
  name: string;
  business: string;
  parent: string;
  icon: string;
  userAttributes: any[];
  createdAt: string;
  updatedAt: string;
  editing: boolean;
}

export interface PeCreateAlbumBody {
  albumId?: string;
  businessId: string;
  description?: string;
  icon: string;
  name: string;
  parent?: string;
  userAttributes?: any[];
}

export interface PeCreateAlbumResponse {
  ancestors: any[];
  business: string;
  name: string;
  icon: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}
