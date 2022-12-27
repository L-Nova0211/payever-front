import { ComponentFactoryResolver } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { CheckoutService } from './checkout.service';
import { MicroLoaderService } from './micro.service';

describe('CheckoutService', () => {

  let service: CheckoutService,
    microLoader: any,
    checkoutComponent: any;

  beforeEach(() => {

    const checkoutComponentMock = {
      instance: {
        hidden$: new BehaviorSubject<boolean>(true),
      },
    };

    const microLoaderSpy = jasmine.createSpyObj('MicroLoaderService', [
      'loadInnerMicroBuild',
    ]);

    const componentFactorySpy = jasmine.createSpyObj('ComponentFactoryResdolver', {
      resolveComponentFactory: {
        create() {
          return {
            hostView: 'host',
          };
        },
      },
    });

    TestBed.configureTestingModule({
      providers: [
        CheckoutService,
        { provide: MicroLoaderService, useValue: microLoaderSpy },
        { provide: ComponentFactoryResolver, useValue: componentFactorySpy },
      ],
    });

    service = TestBed.inject(CheckoutService);
    microLoader = TestBed.inject(MicroLoaderService);

    checkoutComponent = checkoutComponentMock;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should addCheckoutComponent', () => {

    const containerRef = {
      insert() {
        return true;
      },
    } as any;

    // w/o error
    microLoader.loadInnerMicroBuild.and.returnValue(of(true));

    service.addCheckoutComponent(containerRef).subscribe(result => {
      expect(result).toBe(true);
    });

    // w/ error
    microLoader.loadInnerMicroBuild.and.returnValue(throwError('test error'));

    service.addCheckoutComponent(containerRef).subscribe(result => expect(result).toBeNull());

  });

  it('should showCartCheckout', () => {

    service.showCartCheckout();

    service.checkoutComponent = checkoutComponent;

    service.showCartCheckout();

    expect(service.checkoutComponent.instance.hidden$.value).toBe(false);

  });

  it('should hideCartCheckout', () => {

    service.hideCartCheckout();

    service.checkoutComponent = checkoutComponent;

    service.hideCartCheckout();

    expect(service.checkoutComponent.instance.hidden$.value).toBe(true);

  });

});
