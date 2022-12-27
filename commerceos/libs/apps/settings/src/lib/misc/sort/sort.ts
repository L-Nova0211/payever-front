import { SortDirection } from '@angular/material/sort';

export function getSortDirectionValue(sortDirection: SortDirection) {
  return sortDirection === 'asc' ? 1 : -1;
}
