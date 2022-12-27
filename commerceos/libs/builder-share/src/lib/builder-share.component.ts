import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { ContactsGQLService } from '@pe/apps/contacts';
import { EnvService, PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePickerComponent, PePickerDataInterface } from '@pe/ui';

import { PeBuilderShareAccess } from './builder-share.constants';

enum PickedItemType {
  Contact = 'contact',
  Employee = 'employee',
}

interface PickedItem {
  id: string;
  type: PickedItemType | string;
  email: string;
  role: PeBuilderShareAccess | string;
}

@Component({
  selector: 'pe-builder-share',
  templateUrl: './builder-share.component.html',
  styleUrls: ['./builder-share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeBuilderShareComponent implements OnInit {

  @ViewChild('emailPicker') emailPicker: PePickerComponent;

  private readonly emailPickerSearchSubject$ = new BehaviorSubject('');
  private readonly emailPickerDataSubject$ = new BehaviorSubject<PePickerDataInterface<PickedItem>[]>([]);
  readonly emailPickerData$ = this.emailPickerDataSubject$.asObservable();

  formGroup: FormGroup;
  readonly emailPickerControl = new FormControl([]);

  readonly PickedItemRoles = {
    [PeBuilderShareAccess.Editor]: {
      label: 'Editor',
      value: PeBuilderShareAccess.Editor,
    },
    [PeBuilderShareAccess.Viewer]: {
      label: 'Viewer',
      value: PeBuilderShareAccess.Viewer,
    },
  };

  readonly PickedItemRoleOptions = Object.values(this.PickedItemRoles);

  constructor(
    private fb: FormBuilder,
    private overlayWidgetService: PeOverlayWidgetService,
    private envService: EnvService,
    private contactsGQLService: ContactsGQLService,
    private destroy$: PeDestroyService,
    private peOverlayRef: PeOverlayRef,
    @Inject(PE_OVERLAY_DATA) private data: any,
  ) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({

    });
    this.emailPickerSearchSubject$.pipe(
      debounceTime(300),
      switchMap((value) => {
        const configuration: any = {};
        if (value) {
          configuration.email = [{ condition: 'contains', value: [value] }];
        }

        return this.contactsGQLService.getFolderDocuments(null, { configuration });
      }),
      tap((contacts) => {
        this.emailPickerDataSubject$.next(contacts?.collection?.reduce((acc, contact) => {
          if (contact.email) {
            acc.push({
              label: contact.email,
              image: contact.imageUrl,
              value: {
                id: contact._id,
                email: contact.email,
                type: PickedItemType.Contact,
                role: PeBuilderShareAccess.Viewer,
              },
            });
          }

          return acc;
        }, []) ?? []);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
    this.emailPickerControl.valueChanges.subscribe(v => console.log(v))
    this.data.done$.pipe(
      withLatestFrom(this.emailPickerControl.valueChanges),
      map(([, value]) => value),
      tap((value) => {
        console.log(value);
        this.peOverlayRef.close(value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onEmailPickerKeyUp(value: string): void {
    this.emailPickerSearchSubject$.next(value);
  }

  setRole(index: number, role: PeBuilderShareAccess): void {
    if (this.emailPickerControl.value[index]?.value) {
      this.emailPickerControl.value[index].value.role = role;
    }
  }

  addContact(): void {

  }
}
