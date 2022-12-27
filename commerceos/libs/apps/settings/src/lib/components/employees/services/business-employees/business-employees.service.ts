import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PeSearchItem } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PositionsEnum } from '../../../../misc/enum/positions.enum';
import {
  BusinessEmployeesGroupInterface,
  EmployeeStatusEnum,
  NewBusinessEmployeesGroupInterface,
  UserRolesInterface,
} from '../../../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../../../services';
import { GridSortingFieldsEnum } from '../../enums/grid-sorting-fields.enum';
import { EmployeesGridItemInterface } from '../../interfaces/employees-grid-item.interface';
import { PebBusinessEmployeesStorageService } from '../business-employees-storage/business-employees-storage.service';
import { PebEmployeeDialogOpenerService } from '../employee-dialog-opener/peb-employee-dialog-opener.service';

@Injectable()
export class PebBusinessEmployeesService {
  private readonly gridItems$ = new BehaviorSubject<EmployeesGridItemInterface[]>([]);
  private readonly selectedItems$ = new Subject<string[]>();
  private readonly navbarFilters$ = new BehaviorSubject<PeSearchItem[]>([]);

  get businessId(): string {
    return this.envService.businessUuid;
  }

  get filteredGridItems(): EmployeesGridItemInterface[] {
    return this.employeesStorage.getFilteredGridItems();
  }

  constructor(
    private authService: PeAuthService,
    private apiService: ApiService,
    private envService: BusinessEnvService,
    private snackbarService: SnackbarService,
    private employeeDialogOpener: PebEmployeeDialogOpenerService,
    private employeesStorage: PebBusinessEmployeesStorageService,
    private translateService: TranslateService,
  ) {
  }

  // datagrid observables
  getEmployees(): EmployeesGridItemInterface[] {
    return this.gridItems$.value;
  }

  getEmployeesObservable$(): Observable<EmployeesGridItemInterface[]> {
    return this.gridItems$.asObservable();
  }

  getSelectedObservable$(): Observable<string[]> {
    return this.selectedItems$.asObservable();
  }

  getNavbarFiltersObservable$(): Observable<PeSearchItem[]> {
    return this.navbarFilters$.asObservable();
  }

  // navbar filters
  addNewNavbarFilter(filter: PeSearchItem) {
    this.employeesStorage.addNavbarFilter(filter);

    const filters = this.employeesStorage.getNavbarFilters();
    this.navbarFilters$.next(filters);
    this.gridItems$.next(this.filteredGridItems);
  }

  deleteNavbarFilter(deletingIndex: number) {
    this.employeesStorage.removeNavbarFilter(deletingIndex);

    const filters = this.employeesStorage.getNavbarFilters();
    this.navbarFilters$.next(filters);
    this.gridItems$.next(this.filteredGridItems);
  }

  // groups
  createEmployeesGroup(newBusinessName: string): Observable<BusinessEmployeesGroupInterface> {
    const allUserRoles = this.authService.getUserData().roles as UserRolesInterface[];
    const currentBusinessRole = allUserRoles[0].permissions.find(role => role.businessId === this.businessId);
    const permissions = currentBusinessRole ? currentBusinessRole.acls : [];

    const newGroup: NewBusinessEmployeesGroupInterface = { name: newBusinessName, acls: permissions };

    return this.apiService.createBusinessEmployeeGroup(this.businessId, newGroup);
  }

  // employees
  createEmployee(groupId = null) {
    this.employeeDialogOpener.dialogRef = this.employeeDialogOpener.openNewEmployeeDialog(groupId);

    this.employeeDialogOpener.dialogRef.afterClosed.pipe(
      take(1),
      tap((response) => {
        if (response) {
          const { createdEmployee, group } = response;
          if (group) {
            this.employeesStorage.groups.data.find(res => res._id === group._id).employees = group.employees;
          }
          this.addEmployee(createdEmployee);
          this.showSnackBar('dialogs.new_employee.action_result.success.add');
        }
      }),
    ).subscribe();
  }

  addEmployee(newEmployee) {
    this.employeesStorage.addEmployeeToCollection(newEmployee);

    this.gridItems$.next(this.filteredGridItems);
  }

  sendAddEmployeeRequest(businessId, newEmployee) {
    return this.apiService.createBusinessEmployee(businessId, newEmployee);
  }

  editEmployee(employeeId: string) {
    const editingEmployee = this.employeesStorage.getEmployeeById(employeeId);
    this.employeeDialogOpener.dialogRef = this.employeeDialogOpener.openUpdateEmployeeDialog(editingEmployee);

    this.employeeDialogOpener.dialogRef.afterClosed.pipe(
      take(1),
      tap((response) => {
        if (response) {
          const { updatedEmployee } = response;
          this.employeesStorage.editEmployeeInCollection(updatedEmployee);

          const successType = editingEmployee.status == EmployeeStatusEnum.invited
            || editingEmployee.status === EmployeeStatusEnum.inactive
            ? 'invited' : 'edit';
          this.showSnackBar(`dialogs.new_employee.action_result.success.${successType}`);
        }

        this.gridItems$.next(this.filteredGridItems);
      }),
    ).subscribe();
  }

  inviteEmployeeToGroups(employeeId: string) {
    this.apiService.inviteEmployeeToGroups(this.businessId, employeeId).pipe(
      take(1),
      tap({
        next: () => {
          this.showSnackBar('dialogs.new_employee.action_result.success.invited');
        },
      }),
    ).subscribe();
  }

  loadEmployees(employeePosition: PositionsEnum = null, isPositionSelected = null) {
    if (isPositionSelected) {
      this.employeesStorage.setGroupFilter();
      this.employeesStorage.setPositionFilter(employeePosition);
    } else {
      this.employeesStorage.setPositionFilter();
      this.employeesStorage.setGroupFilter(employeePosition);
    }
    if (this.employeesStorage.isEmployeesLoaded) {
      // employees have been already loaded, only selected position have been changed
      this.gridItems$.next(this.filteredGridItems);

      return;
    }

    this.apiService.getBusinessEmployeeList(this.businessId).pipe(
      take(1),
      tap((list) => {
        this.employeesStorage.setEmployeesList(list.data);

        this.gridItems$.next(this.filteredGridItems);
      }),
    ).subscribe();
  }

  refreshExistEmployees() {
    if (this.employeesStorage.isEmployeesLoaded) {
      // employees have been already loaded, only selected position have been changed
      this.gridItems$.next(this.filteredGridItems);

      return;
    }
  }

  deleteSelectedEmployees(employeeIds: string[]) {
    const deletingEmployees = employeeIds.map(
      deletingId => this.apiService.deleteBusinessEmployee(this.businessId, deletingId)
        .pipe(
          tap(() => {
            this.employeesStorage.deleteEmployeeFromCollection(deletingId);
          }),
        ),
    );

    forkJoin(...deletingEmployees).pipe(
      take(1),
      tap({
        complete: () => this.gridItems$.next(this.filteredGridItems),
      }),
    ).subscribe();
  }

  // select items actions
  selectAllEmployees() {
    const visibleItem = this.filteredGridItems;
    const visibleSelectedIds = visibleItem.map(({ id }) => id);

    this.selectedItems$.next(visibleSelectedIds);
  }

  deselectEmployee(ids: string[] = []) {
    this.selectedItems$.next([]);
  }

  sortEmployees(field: GridSortingFieldsEnum) {
    this.employeesStorage.sortEmployees(field);

    this.gridItems$.next(this.filteredGridItems);
  }

  showSnackBar(notification: string = 'form.create_form.employee.options.saved', success = true) {
    this.snackbarService.toggle(true, {
      content: this.translateService.translate(notification),
      duration: 3000,
      iconId: success ? 'icon-commerceos-success' : 'icon-alert-24',
      iconSize: 24,
    });
  }
}
