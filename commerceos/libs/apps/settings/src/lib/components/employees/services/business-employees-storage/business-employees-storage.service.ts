import { Injectable } from '@angular/core';

import { PeFilterContainsEnum, PeSearchItem } from '@pe/common';

import { PositionsEnum } from '../../../../misc/enum/positions.enum';
import { BusinessEmployeeInterface } from '../../../../misc/interfaces/business-employees/business-employee.interface';
import { GridSortingFieldsEnum } from '../../enums/grid-sorting-fields.enum';
import { navbarFilterKeysEnum } from '../../enums/navbar-filter-keys.enum';
import { IGroupsInterface } from '../../interfaces/employee-group.interface';
import { EmployeesGridItemInterface } from '../../interfaces/employees-grid-item.interface';
import {
  PebEmployeesGridSortHelperService,
} from '../employee-grid-sorting-helper/employees-grid-sorting-helper.service';
import { PebGridDataConverterService } from '../grid-data-converter/peb-grid-data-converter.service';

@Injectable()
export class PebBusinessEmployeesStorageService {
  // employees and grid items
  private employees: BusinessEmployeeInterface[] = [];
  private allGridItems: EmployeesGridItemInterface[];
  private _groups: IGroupsInterface;

  // filters
  private positionFilter: PositionsEnum;
  private groupFilter: string;
  private navbarFilters: PeSearchItem[] = [];

  private initialized = false;

  set isEmployeesLoaded(value) {
    this.initialized = value;
  }

  get isEmployeesLoaded(): boolean {
    return this.initialized;
  }

  set groups(groups) {
    this._groups = groups;
  }

  get groups() {
    return this._groups;
  }

  constructor(
    private dataConverter: PebGridDataConverterService,
    private sortHelper: PebEmployeesGridSortHelperService,
  ) { }

  setPositionFilter(employeePosition: PositionsEnum = null) {
    this.positionFilter = employeePosition;
  }

  setGroupFilter(employeeGroup: string = null) {
    this.groupFilter = employeeGroup;
  }

  getNavbarFilters(): PeSearchItem[] {
    return [...this.navbarFilters];
  }

  addNavbarFilter(newFilter: PeSearchItem) {
    this.navbarFilters.push(newFilter);
  }

  removeNavbarFilter(deletingIndex: number) {
    this.navbarFilters.splice(deletingIndex, 1);
  }

  getFilteredGridItems(): EmployeesGridItemInterface[] {
    let filteredGridItems = this.allGridItems;

    // filter by position
    if (this.positionFilter) {
      filteredGridItems = filteredGridItems.filter(
        ({ data }) => data.position && data.position === this.positionFilter,
      );
    }

    // filter by group
    if (this.groupFilter) {
      const employeesIds = this.groups?.data.find(group => group.name === this.groupFilter)?.employees;
      filteredGridItems = filteredGridItems.filter(
        (item =>  employeesIds?.find(id => id === item.id)),
      );
    }

    // filter by navbar filters
    this.navbarFilters.forEach((navbarFilter) => {
      filteredGridItems = this.filterItemsByNavbarFilter(filteredGridItems, navbarFilter);
    });

    return filteredGridItems;
  }

  setEmployeesList(allEmployees: BusinessEmployeeInterface[]) {
    this.employees = allEmployees;
    this.allGridItems = allEmployees.map(employee => this.dataConverter.convertEmployeeToGridItem(employee));
    this.initialized = true;
  }

  sortEmployees(field: GridSortingFieldsEnum) {
    const sortFn = this.sortHelper.getSortingFunctionByType(field);
    this.allGridItems.sort(sortFn);
  }

  // employee action
  addEmployeeToCollection(newEmployee: BusinessEmployeeInterface) {
    const newGridItem = this.dataConverter.convertEmployeeToGridItem(newEmployee);

    this.employees.push(newEmployee);
    this.allGridItems.push(newGridItem);
  }

  editEmployeeInCollection(updatedEmployee: BusinessEmployeeInterface) {
    const updatedEmployeeIndex = this.employees.findIndex(({ _id }) => _id === updatedEmployee._id);
    this.employees[updatedEmployeeIndex] = updatedEmployee;

    const updatedItemIndex = this.allGridItems.findIndex(({ id }) => id === updatedEmployee._id);
    this.allGridItems[updatedItemIndex] = this.dataConverter.convertEmployeeToGridItem(updatedEmployee);
  }

  deleteEmployeeFromCollection(deletingId: string) {
    const deletedEmployeeIndex = this.employees.findIndex(({ _id }) => _id === deletingId);
    const deletedItemIndex = this.allGridItems.findIndex(({ id }) => id === deletingId);

    this.employees.splice(deletedEmployeeIndex, 1);
    this.allGridItems.splice(deletedItemIndex, 1);
  }

  getEmployeeById(editedEmployeeId: string) {
    return this.employees.find(({ _id }) => _id === editedEmployeeId) || null;
  }

  private filterItemsByNavbarFilter(
    sourceItemsArray: EmployeesGridItemInterface[], navbarFilter: PeSearchItem,
  ): EmployeesGridItemInterface[] {
    const text = navbarFilter.searchText.toLowerCase();

    return sourceItemsArray.filter((gridItem) => {
      const gridItemFieldValue = this.chooseGridItemFieldByFilterType(gridItem, navbarFilter);

      return navbarFilter.contains === PeFilterContainsEnum.Contains
        ? gridItemFieldValue.includes(text)
        : !gridItemFieldValue.includes(text);
    });
  }

  private chooseGridItemFieldByFilterType(gridItem: EmployeesGridItemInterface, navbarFilter: PeSearchItem): string {
    let gridItemFieldValue: string;

    switch (navbarFilter.filter) {
      case navbarFilterKeysEnum.All:
        gridItemFieldValue = gridItem.title as string;
        break;

      case navbarFilterKeysEnum.Name:
        gridItemFieldValue = gridItem.title as string;
        break;

      default:
        break;
    }

    return gridItemFieldValue.toLowerCase();
  }
}
