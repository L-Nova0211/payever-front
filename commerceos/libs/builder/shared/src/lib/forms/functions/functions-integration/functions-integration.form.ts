import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';

import { PebEditorAccessorService } from '@pe/builder-services';

@Component({
  selector: 'peb-functions-integration',
  templateUrl: './functions-integration.form.html',
  styleUrls: [
    '../../../../../../styles/src/lib/styles/_sidebars.scss',
    './functions-integration.form.scss',
  ],
})
export class PebFunctionsIntegrationForm implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() functions: any;

  treeControl = new NestedTreeControl<any>(node => node.children);
  dataSource = new MatTreeNestedDataSource<any>();

  get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    private editorAccessorService: PebEditorAccessorService,
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.functions;
  }

  hasChild = (_: number, node: any) => node.children?.length > 0;

  removeLinks(): void {
    this.formGroup.patchValue({
      integration: null,
      action: null,
      data: null,
      interaction: null,
    });
    this.backTo('main');
  }

  backTo(direct: string): void {
    this.editor.backTo(direct);
  }

  pickIntegration(node: any): void {
    const { integration, action, interaction, data } = node;

    this.formGroup.patchValue({ integration, action, data, interaction });
    this.backTo('main');
  }

}
