import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface DialogData {
  title?: string;
  message: string;
  showInput?: boolean;
  placeholder?: string;
  confirmText?: string;
}

@Component({
    selector: 'app-basic-modal',
    imports: [
      CommonModule,
      MatDialogModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      FormsModule
    ],
    templateUrl: './basic-modal.component.html',
    styleUrls: ['./basic-modal.component.scss'],
    standalone: true
})
export class BasicModalComponent {
  inputValue: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<BasicModalComponent>
  ) {}

  onSubmit() {
    if (this.data.showInput && !this.inputValue) {
      return;
    }
    this.dialogRef.close(this.data.showInput ? this.inputValue : true);
  }
}
