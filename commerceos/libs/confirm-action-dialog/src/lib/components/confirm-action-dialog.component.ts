import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Inject,
  Injector,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'confirm-action-dialog',
  templateUrl: 'confirm-action-dialog.component.html',
  styleUrls: ['confirm-action-dialog.component.scss'],
})
export class ConfirmActionDialogComponent implements AfterViewInit {

  @ViewChild('projectedContent', { static: false, read: ViewContainerRef }) projectedContent: ViewContainerRef;

  private componentRef: ComponentRef<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmActionDialogComponent>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
  ) {}

  ngAfterViewInit(): void {
    if (this.data.component) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.data.component);
      this.componentRef = componentFactory.create(this.injector) as ComponentRef<any>;
      this.projectedContent.insert(this.componentRef.hostView);
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onConfirmClick(): void {
    if (this.data.component) {
      if (!this.componentRef.instance.errors) {
        this.dialogRef.close(this.componentRef.instance.form.value);
      }
    } else {
      this.dialogRef.close(true);
    }
  }
}
