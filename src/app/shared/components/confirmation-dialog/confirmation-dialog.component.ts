import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  iconFilled?: boolean;
  // Input field options
  showInput?: boolean;
  inputPlaceholder?: string;
  inputValue?: string;
  inputType?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  dialogRef = inject<MatDialogRef<ConfirmationDialogComponent>>(MatDialogRef);
  data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);

  inputValue = '';

  constructor() {
    const data = this.data;

    // Set defaults
    this.data = {
      icon: data.icon || 'help_outline',
      confirmText: data.confirmText || 'Confirm',
      cancelText: data.cancelText || 'Cancel',
      iconFilled: data.iconFilled !== undefined ? data.iconFilled : false,
      showInput: data.showInput || false,
      inputPlaceholder: data.inputPlaceholder || '',
      inputType: data.inputType || 'text',
      ...data
    };

    // Initialize input value if provided
    this.inputValue = data.inputValue || '';
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    if (this.data.showInput) {
      this.dialogRef.close(this.inputValue);
    } else {
      this.dialogRef.close(true);
    }
  }
}
