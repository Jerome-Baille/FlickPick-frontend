import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-action-modal',
  templateUrl: './action-modal.component.html',
  styleUrls: ['./action-modal.component.sass']
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
