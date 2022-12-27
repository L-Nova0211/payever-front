import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { countries } from 'country-data-list';

import { PebCountryPickerComponent } from './country-picker';

describe('PebCountryPickerComponent', () => {

  let fixture: ComponentFixture<PebCountryPickerComponent>;
  let component: PebCountryPickerComponent;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        MatAutocompleteModule,
      ],
      declarations: [
        PebCountryPickerComponent,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebCountryPickerComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should set countries on init', () => {

    // w/o externalCountries
    component.ngOnInit();

    expect(component[`countries`]).toEqual(countries.all.map(c => c.name));

    // w/ externalCountries
    component.externalCountries = ['test.country'];
    component.ngOnInit();

    expect(component[`countries`]).toEqual(['test.country']);

  });

  // it('should emit changes', () => {
  //
  //   const changeSpy = spyOn(component, 'onChange');
  //
  //   component.emitChanges();
  //
  //   expect(changeSpy).toHaveBeenCalledWith([]);
  //
  // });

  it('should handle on key', () => {

    const customSpy = spyOn<any>(component, 'customFilter').and.callThrough();
    const event = {
      target: {
        value: 'ger',
      },
    };

    component.onKey(event);

    expect(customSpy).toHaveBeenCalledWith(event.target.value);
    expect(component.filteredOptions).toEqual([
      'German Democratic Republic',
      'Germany',
      'Algeria',
      'Niger',
      'Nigeria',
    ]);

  });

  // it('should add country', () => {
  //
  //   const touchSpy = spyOn(component, 'onTouched');
  //   const emitSpy = spyOn(component, 'emitChanges');
  //
  //   // w/o real country
  //   component.inputRef.nativeElement.value = 'test';
  //   component.addCountry();
  //
  //   expect(component.addedCountries.length).toBe(0);
  //   expect(touchSpy).toHaveBeenCalled();
  //   expect(emitSpy).toHaveBeenCalled();
  //
  //   // w/ real country
  //   // not added yet
  //   component.inputRef.nativeElement.value = 'Poland';
  //   component.addCountry();
  //
  //   expect(component.addedCountries).toEqual(['Poland']);
  //   expect(component.inputRef.nativeElement.value).toEqual('');
  //
  //   // already added
  //   component.inputRef.nativeElement.value = 'Poland';
  //
  //   expect(() => {
  //     component.addCountry();
  //   }).toThrowError();
  //
  // });

  it('should handle remove country', () => {

    const emitSpy = spyOn(component, 'emitChanges');

    component.addedCountries = [
      'USA',
      'Germany',
      'Russia',
    ];

    component.onRemoveCountry(null, 0);

    expect(component.addedCountries).toEqual(['Germany', 'Russia']);
    expect(emitSpy).toHaveBeenCalled();

  });

  // it('should write value', () => {
  //
  //   component.addedCountries = [
  //     'USA',
  //     'Germany',
  //     'Russia',
  //   ];
  //
  //   component.writeValue(null);
  //
  //   expect(component.addedCountries).toEqual([]);
  //
  // });
  //
  // it('should call & register on change', () => {
  //
  //   const fn = () => { };
  //
  //   component.onChange(null);
  //   component.registerOnChange(fn);
  //
  //   expect(component.onChange).toEqual(fn);
  //
  // });
  //
  // it('should call & register on touched', () => {
  //
  //   const fn = () => { };
  //
  //   component.onTouched();
  //   component.registerOnTouched(fn);
  //
  //   expect(component.onTouched).toEqual(fn);
  //
  // });

});
