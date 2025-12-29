import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { DataService } from 'src/app/core/services/data.service';

@Component({
    selector: 'app-action-modal',
    imports: [
      CommonModule,
      MatDialogModule,
      MatListModule,
      MatCheckboxModule
    ],
    templateUrl: './action-modal.component.html',
    styleUrls: ['./action-modal.component.scss'],
    standalone: true
})
export class ActionModalComponent implements OnInit {
  lists: any;
  selectedLists: number[] = [];

  constructor(
    private dialogRef: MatDialogRef<ActionModalComponent>,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.dataService.getAllListsForUser().subscribe((lists) => {
      this.lists = lists;
    });
  }

  toggleSelection(listId: number) {
    const index = this.selectedLists.indexOf(listId);
    if (index === -1) {
      this.selectedLists.push(listId);
    } else {
      this.selectedLists.splice(index, 1);
    }
  }
  
  confirmSelection() {
    this.dialogRef.close(this.selectedLists);
  }
}
