export interface SearchGroup {
  heading?: string;
  items: SearchGroupItems[];
}

export interface SearchGroupItems {
  description: string;
  title: string;
  iconSrc?: string;
  id?: string;
  imageIconSrc?: string;
  logo?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  url?: string;
}
