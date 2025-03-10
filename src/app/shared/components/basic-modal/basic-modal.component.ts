import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  title?: string;
  message: string;
}

@Component({
    selector: 'app-basic-modal',
    templateUrl: './basic-modal.component.html',
    styleUrls: ['./basic-modal.component.sass'],
    standalone: false
})
export class BasicModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
