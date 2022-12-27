export interface Pagination {
  page: number;
  page_count: number;
  per_page: number;
  item_count: number;
}

export interface PaginationCamelCase {
  page: number;
  pageCount?: number;
  perPage: number;
  itemCount?: number;
}

export interface PaginationInfoCamelCase {
  pagination: PaginationCamelCase;
}
