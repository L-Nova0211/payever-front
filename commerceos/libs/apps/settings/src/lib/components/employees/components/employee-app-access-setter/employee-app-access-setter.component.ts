import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ControlContainer, FormBuilder, FormGroup } from '@angular/forms';

import { AbstractComponent } from '../../../abstract';
import { AppAclFormInterface } from '../../interfaces';

@Component({
  selector: 'peb-employee-app-access-setter',
  templateUrl: './employee-app-access-setter.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeAppAccessSetterComponent extends AbstractComponent implements OnInit {
  @Input() code = '';
  @Input() message = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private controlContainer: ControlContainer,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = (this.controlContainer as any).form.get(['acls', this.code]);
  }

  getControl(name: keyof AppAclFormInterface): any {
    return this.form.get(name);
  }
}
