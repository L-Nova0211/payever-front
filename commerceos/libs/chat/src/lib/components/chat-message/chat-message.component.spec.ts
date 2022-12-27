import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing'
import { PeChatMessageComponent } from './chat-message.component'
import {NO_ERRORS_SCHEMA} from '@angular/core'
import {MediaService} from '@pe/media'
import {EnvironmentConfigInterface, PE_ENV} from '@pe/common'
import {PebEnvService} from '@pe/builder-core'
import {NgxsSelectSnapshotModule} from '@ngxs-labs/select-snapshot'
import {Store} from '@ngrx/store'
import {NoopAnimationsModule} from '@angular/platform-browser/animations'
import { PeTagTransformerPipe } from '../../pipes'

let messageObjectSpy;

describe('', () => {
	let fixture: ComponentFixture<PeChatMessageComponent>;
	let component: PeChatMessageComponent;
	let peEnv: EnvironmentConfigInterface;
	const initialState = { user: { email: 'test@test.com' } };

	beforeEach(waitForAsync(() => {
		spyOnProperty(PeChatMessageComponent.prototype, 'userData').and.returnValue(initialState as any);

		const mediaServiceSpy = jasmine.createSpyObj<MediaService>('MediaService', {
			getMediaUrl: 'url/image',
		});

		TestBed.configureTestingModule({
			imports: [NoopAnimationsModule,
				NgxsSelectSnapshotModule],
			declarations: [PeChatMessageComponent, PeTagTransformerPipe],
			providers: [
				{provide: MediaService, useValue: mediaServiceSpy},
				{provide: PE_ENV, useValue: {}},
				{provide: PebEnvService, useValue: {}},
				{provide: Store, useValue: {} },
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents().then(() => {
			peEnv = TestBed.inject(PE_ENV)
			fixture = TestBed.createComponent(PeChatMessageComponent);
			component = fixture.componentInstance;
			component.pinnedMessages = [];
			messageObjectSpy = spyOnProperty(component, 'messageObj').and.returnValue({content: 'https://test.com'});
		});

	}));

	it('should be defined', () => {
		fixture.detectChanges();
		expect(component).toBeDefined();
	});

	it('should convert urls to links in messages', () => {
		component.messageObj = {content: 'text https://test.com text'};
		expect(component.msg).toMatch('<a href="https://test.com" target="_blank">https://test.com</a>');
	});

  it('should not add link for messages started with ...', () => {
    component.messageObj = {content: '...test'};
    expect(component.msg).toMatch('...test');
  });

  it('should not add link for messages which contain ...', () => {
    component.messageObj = {content: 'test...test'};
    expect(component.msg).toMatch('test...test');
  });

});
