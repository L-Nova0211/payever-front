import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

const LAST_CREATED_FIXTURE = 'pe-editor-last-fixture';

@Component({
  selector: 'sandbox-editor-create-shop-dialog',
  templateUrl: './create-shop.dialog.html',
  styleUrls: ['./create-shop.dialog.scss'],
})
export class SandboxEditorCreateShopDialog {
  fixture = JSON.parse(localStorage.getItem(LAST_CREATED_FIXTURE)) || ['apple'];

  private nameHasBeenChangedByUser = false;
  private randomHash = Math.random().toString(36).substring(7);

  name = `${this.fixture[0]}-${this.randomHash}`;

  constructor(
    @Inject(MAT_DIALOG_DATA) public fixtures: string[],
    private dialogRef: MatDialogRef<SandboxEditorCreateShopDialog>,
  ) {}

  close(doCreate: boolean) {
    if (doCreate) {
      localStorage.setItem(LAST_CREATED_FIXTURE, JSON.stringify(this.fixture));
    }

    this.dialogRef.close(
      doCreate ? { name: this.name, fixture: this.fixture[0] } : null,
    );
  }

  @HostListener('document:keydown', ['$event'])
  handleSelectFixtureHotkey(e: KeyboardEvent) {
    let nextFixture;

    if (e.key === 'ArrowUp') {
      nextFixture = [this.fixtures[this.fixtures.findIndex(f => f === this.fixture[0]) - 1]];
    }

    if (e.key === 'ArrowDown') {
      nextFixture = [this.fixtures[this.fixtures.findIndex(f => f === this.fixture[0]) + 1]];
    }

    if (e.metaKey && !isNaN(e.key as any)) {
      nextFixture = [this.fixtures[parseInt(e.key, 10) - 1]];
    }

    if (!nextFixture || !nextFixture[0]) {
      return;
    }

    e.preventDefault();
    this.fixture = nextFixture;
    this.onChangeFixture();
  }

  onChangeName() {
    if (!this.nameHasBeenChangedByUser) {
      this.nameHasBeenChangedByUser = true;
    }
  }

  onChangeFixture() {
    if (this.nameHasBeenChangedByUser) {
      return;
    }

    this.name = `${this.fixture[0]}-${this.randomHash}`;
  }
}
