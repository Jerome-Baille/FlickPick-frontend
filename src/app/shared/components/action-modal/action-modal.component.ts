import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { DataService, ListItem } from 'src/app/core/services/data.service';

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
  private dialogRef = inject<MatDialogRef<ActionModalComponent>>(MatDialogRef);
  private dataService = inject(DataService);

  lists: ListItem[] = [];
  selectedLists: number[] = [];

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
