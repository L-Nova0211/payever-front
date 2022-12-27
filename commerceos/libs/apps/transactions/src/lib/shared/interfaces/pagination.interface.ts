export interface PaginationInterface {
  amount?: number;
  amount_currency?: string;
  last?: number;
  page?: number;
  numItemsPerPage?: number;
  first?: number;
  pageCount?: number;
  total?: number;
  pageRange?: number;
  startPage?: number;
  endPage?: number;
  pagesInRange?: [number];
  firstPageInRange?: number;
  lastPageInRange?: number;
  currentItemCount?: number;
  firstItemNumber?: number;
  lastItemNumber?: number;
}
