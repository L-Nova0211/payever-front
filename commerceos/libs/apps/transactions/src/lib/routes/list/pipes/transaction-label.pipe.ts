import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transactionLabel',
})
export class TransactionLabelPipe implements PipeTransform {
  transform(columns: { name: string; value: string | Date; label?: string }[], searchName): any {
    const column = columns.find(col => col.name === searchName);

    return column.label ?? column.value;
  }
}
