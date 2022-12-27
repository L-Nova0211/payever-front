import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WallpaperService } from '@app/services';
import { Subject } from 'rxjs';
import { FakeHttpClient } from 'test.helpers';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { PlatformService } from '@pe/ng-kit/modules/common';
import { DockerModule, DockerItemInterface } from '@pe/ng-kit/modules/docker';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { nonRecompilableTestModuleHelper } from '@pe/ng-kit/modules/test';

import { BaseDashboardComponent } from './base-dashboard.component';
import { ProfileButtonComponent } from '../profile-button/profile-button.component';
import { WallpaperModule } from '@pe/ng-kit/modules/wallpaper';


const stubDockerItems: DockerItemInterface[] = [{
  icon: 'stub_icon',
  title: 'stub_item_1',
  count: 3,
  active: false,
  onSelect: (active: boolean) => {
    console.log(`Stub callback action: active ${active}`);
  },
}, {
  icon: 'stub_icon',
  title: 'stub_item_2',
  count: 3,
  active: false,
  onSelect: (active: boolean) => {
    console.log(`Stub callback action: active ${active}`);
  },
}, {
  icon: 'stub_icon',
  title: 'stub_item_3',
  count: 3,
  active: false,
  onSelect: (active: boolean) => {
    console.log(`Stub callback action: active ${active}`);
  },
}];

describe('BaseDashboardComponent', () => {
  let component: BaseDashboardComponent;
  let fixture: ComponentFixture<BaseDashboardComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      BaseDashboardComponent,
      ProfileButtonComponent,
    ],
    imports: [
      BrowserAnimationsModule,
      DockerModule,
      BrowserModule,
      MediaModule,
      WallpaperModule,
    ],
    providers: [
      {
        provide: AuthService,
        useValue: {
          getUserData: () => ({}),
        },
      },
      {
        provide: HttpClient,
        useValue: new FakeHttpClient,
      },
      {
        provide: PlatformHeaderService,
        useValue: {},
      },
      {
        provide: PlatformService,
        useValue: {
          microContainerType$: new Subject(),
        },
      },
      {
        provide: WallpaperService,
        useClass: WallpaperService,
      },
      {
        provide: EnvironmentConfigService,
        useValue: {},
      },
      
    ],
  });

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BaseDashboardComponent);
    component = fixture.componentInstance;
  }));

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy('fail with initialize component');
    });
  });

  describe('Passing of the background image', () => {
    it('Should init dashboard', () => {
      expect(component.backgroundImageUrl).toBeFalsy();
      component.backgroundImage = 'https://stub_image.com/stub_image.jpg';
      fixture.detectChanges();
      expect(component.backgroundImageUrl).toBeTruthy();
    });
  });

  describe('Passing of the docker items', () => {
    it('Should init docker', () => {
      expect(component.dockerItems).toBeFalsy();
      component.dockerItems = stubDockerItems;
      fixture.detectChanges();
      expect(component.dockerItems).toBeTruthy();
    });
  });

  // describe('Profile button click event', () => {
  //   it('Should detect when profile button was clicked', () => {
  //     component.profileButtonClicked.subscribe((event: MouseEvent) => {
  //       expect(event).not.toBeNull();
  //     });
  //     (document.querySelector('.profile-toggle-btn') as HTMLElement).click();
  //   });
  // });

  describe('Docker items change event', () => {
    it('Should detect when docker items were changed', () => {
      component.dockerItemsChange.subscribe((event: DockerItemInterface[]) => {
        expect(event).toEqual(stubDockerItems);
      });
      component.dockerItemsChange.emit(stubDockerItems);
    });
  });

});
