import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';

import { SnackbarErrorService } from './snackbar-error.service';
import { PebEditorSnackbarErrorComponent } from './snackbar-error/snackbar-error.component';

describe('SnackbarErrorService', () => {

  let service: SnackbarErrorService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {

    const snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', [
      'dismiss',
      'openFromComponent',
    ]);

    const routerMock = {
      events: of(new NavigationEnd(1, '/test', '/test')),
      url: '/test/builder?test=true',
    };

    TestBed.configureTestingModule({
      providers: [
        SnackbarErrorService,
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerMock },
      ],
    });

    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

  });

  it('should be defined', () => {

    service = TestBed.inject(SnackbarErrorService);

    expect(service).toBeDefined();

  });

  it('should open snackbar error', () => {

    const data = {
      position: 'top',
      panelClass: ['panel'],
      retryAction: () => { },
      cancelAction: () => { },
      retryBtnCaption: 'Retry',
      hideBtnCaption: 'Hide',
      errorText: 'Error!',
      textStyles: {},
      actionStyles: {},
      text: 'Test Error',
      reloadOnHide: true,
    };

    router['url' as any] = '/test/shop?test=true';

    service = TestBed.inject(SnackbarErrorService);

    // w/o data
    service.openSnackbarError();

    expect(snackBar.openFromComponent).toHaveBeenCalledWith(PebEditorSnackbarErrorComponent, {
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error-container'],
      data: {
        retryAction: null,
        cancelAction: null,
        retryBtnCaption: null,
        hideBtnCaption: null,
        errorText: null,
        textStyles: null,
        actionStyles: null,
        text: 'Something went wrong',
        reloadOnHide: false,
      },
    });

    // w/ data
    service.openSnackbarError(data as any);

    expect(snackBar.openFromComponent).toHaveBeenCalledWith(PebEditorSnackbarErrorComponent, {
      verticalPosition: data.position as any,
      panelClass: ['mat-snackbar-error-container', 'panel'],
      data: {
        retryAction: data.retryAction,
        cancelAction: data.cancelAction,
        retryBtnCaption: data.retryBtnCaption,
        hideBtnCaption: data.hideBtnCaption,
        errorText: data.errorText,
        textStyles: data.textStyles,
        actionStyles: data.actionStyles,
        text: data.text,
        reloadOnHide: data.reloadOnHide,
      },
    });

  });

  it('should set destroy subject on destroy', () => {

    service = TestBed.inject(SnackbarErrorService);

    const nextSpy = spyOn(service[`destroyedSubject$`], 'next').and.callThrough();
    const completeSpy = spyOn(service[`destroyedSubject$`], 'complete').and.callThrough();

    service.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(completeSpy).toHaveBeenCalled();

  });

});
