import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';

export interface DialogData {
  title?: string;
  message: string;
}

@Component({
    selector: 'app-basic-modal',
    imports: [
      MatDialogModule
    ],
    templateUrl: './basic-modal.component.html',
    styleUrls: ['./basic-modal.component.scss'],
    standalone: true
})
export class BasicModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
