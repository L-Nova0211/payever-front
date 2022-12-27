import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LocalesSwitcherComponent } from './locales-switcher.component';
import { nonRecompilableTestModuleHelper, fakeOverlayContainer, FakeOverlayContainer } from '../../../../test';
import { LocaleService, TranslationLoaderService, TranslationLoaderStubService, LocaleConstantsService } from '../../services';
import { LocaleInterface } from '../../interfaces';
import { I18N_CONFIG, LANG, DEFAULT_LANG, LOCALES } from '../../constants';
import { getLangList } from '../../lib';

describe('LocalesSwitcherComponent', () => {
  let fixture: ComponentFixture<LocalesSwitcherComponent>;
  let component: LocalesSwitcherComponent;

  const {
    overlayContainerElement,
    fakeElementContainerProvider
  }: FakeOverlayContainer = fakeOverlayContainer();

  const localesSwitcherButtonSelector: string = '.locales-switcher-button';
  const transparentLocalesSwitcherButtonSelector: string = `${localesSwitcherButtonSelector}.mat-button-transparent`;
  const darkLocalesSwitcherButtonSelector: string = `${localesSwitcherButtonSelector}.mat-button-dark`;
  const localeLinkSelector: string = '.locale-switcher-link';
  const activeLocaleLinkSelector: string = `${localeLinkSelector}.active`;

  nonRecompilableTestModuleHelper({
    imports: [
      NoopAnimationsModule,
      MatButtonModule,
      MatMenuModule
    ],
    providers: [
      { provide: LANG, useValue: DEFAULT_LANG },
      { provide: LOCALES, useFactory: getLangList },
      { provide: I18N_CONFIG, useValue: {} },
      { provide: TranslationLoaderService, useValue: new TranslationLoaderStubService() },
      fakeElementContainerProvider,
      LocaleService,
      LocaleConstantsService
    ],
    declarations: [
      LocalesSwitcherComponent
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalesSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render switch button', () => {
    const button: DebugElement = fixture.debugElement.query(By.css(localesSwitcherButtonSelector));
    expect(button).toBeTruthy();
    expect(button.nativeElement instanceof HTMLButtonElement).toBe(true);
  });

  it('accept @Input() transparent', () => {
    let transparentButton: DebugElement;

    transparentButton = fixture.debugElement.query(By.css(transparentLocalesSwitcherButtonSelector));
    expect(transparentButton).toBeNull('button should not be transparent by default');

    component.transparent = true;
    fixture.detectChanges();
    transparentButton = fixture.debugElement.query(By.css(transparentLocalesSwitcherButtonSelector));
    expect(transparentButton).not.toBeNull('button should become transparent after option enable');

    component.transparent = false;
    fixture.detectChanges();
    transparentButton = fixture.debugElement.query(By.css(transparentLocalesSwitcherButtonSelector));
    expect(transparentButton).toBeNull('button should not stay transparent after option disable');
  });

  it('accept @Input() dark', () => {
    let darkButton: DebugElement;

    darkButton = fixture.debugElement.query(By.css(darkLocalesSwitcherButtonSelector));
    expect(darkButton).toBeNull('button should not be dark by default');

    component.dark = true;
    fixture.detectChanges();
    darkButton = fixture.debugElement.query(By.css(darkLocalesSwitcherButtonSelector));
    expect(darkButton).not.toBeNull('button should become dark after option enable');

    component.dark = false;
    fixture.detectChanges();
    darkButton = fixture.debugElement.query(By.css(darkLocalesSwitcherButtonSelector));
    expect(darkButton).toBeNull('button should not stay dark after option disable');
  });

  describe('with menu opening', () => {
    beforeEach(() => {
      component.matMenuTrigger.openMenu();
    });

    afterEach(() => {
      component.matMenuTrigger.closeMenu();
    });

    describe('with LocaleService', () => {
      let localeService: LocaleService;

      beforeEach(() => {
        localeService = TestBed.get(LocaleService);
      });

      afterEach(() => {
        localeService.setLocaleConfig(getLangList());
        localeService.setCurrentLocale(DEFAULT_LANG);
      });

      it('accept locales$ provided by LocaleService', () => {
        let localeLinks: HTMLAnchorElement[];

        const originalLocales: LocaleInterface[] = localeService.locales$.getValue();
        expect(originalLocales.length).toBeGreaterThan(0); // self-check

        localeLinks = Array.from(overlayContainerElement.querySelectorAll(localeLinkSelector));
        expect(localeLinks.length).toBe(originalLocales.length, 'Should render all locales');

        const newLocales: LocaleInterface[] = [originalLocales[0]];
        localeService.locales$.next(newLocales);
        fixture.detectChanges();
        localeLinks = Array.from(overlayContainerElement.querySelectorAll(localeLinkSelector));
        expect(localeLinks.length).toBe(newLocales.length, 'Should render all locales after update');
      });

      it('accept currentLocale$ provided by LocaleService', () => {
        let activeLinks: HTMLAnchorElement[];

        const originalCurrentLocale: LocaleInterface = localeService.currentLocale$.getValue();
        expect(originalCurrentLocale).toBeTruthy();

        activeLinks = Array.from(overlayContainerElement.querySelectorAll(activeLocaleLinkSelector));
        expect(activeLinks.length).toBe(1, 'should render single "active" link');

        const activeLocaleLinkWas: HTMLAnchorElement = activeLinks[0];
        const anotherLocaleCode: string = localeService.locales$.getValue()
          .map(({ code }) => code)
          .find(code => code !== originalCurrentLocale.code);
        expect(anotherLocaleCode).toBeTruthy(); // self-test
        localeService.setCurrentLocale(anotherLocaleCode);
        fixture.detectChanges();
        activeLinks = Array.from(overlayContainerElement.querySelectorAll(activeLocaleLinkSelector));
        expect(activeLinks.length).toBe(1, 'should render single "active" link');
      });
    });
  });
});
