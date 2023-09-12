import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface DialogData {
  formType: string;
}

@Component({
  selector: 'app-create-group-modal',
  templateUrl: './create-group-modal.component.html',
  styleUrls: ['./create-group-modal.component.sass']
})
export class CreateGroupModalComponent implements OnInit {
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  groupForm: FormGroup;
  isNewListName = false;
  users: any[] = [];
  listNames: string[] = [];
  dialogResult: any;
  filteredListNames!: Observable<string[]>;
  filteredUsers!: Observable<any[]>;
  selectedUsers: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogRef: MatDialogRef<CreateGroupModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.formType === 'listName') {
      this.groupForm = this.formBuilder.group({
        listName: ['', Validators.required]
      });
    } else if (data.formType === 'userIds') {
      this.groupForm = this.formBuilder.group({
        userIds: [[], [Validators.required, Validators.minLength(2)]]
      });
    } else if (data.formType === 'name') {
      this.groupForm = this.formBuilder.group({
        name: ['', Validators.required]
      });
    } else {
      this.groupForm = this.formBuilder.group({
        name: ['', Validators.required],
        listName: ['', Validators.required],
        userIds: [[], [Validators.required, Validators.minLength(2)]]
      });
    }
  }

  ngOnInit() {
    if (this.groupForm.contains('listName')) {
      this.dataService.getAllListsForUser().subscribe({
        next: (response: any) => {
          if (response.length > 0) {
            this.listNames = response.map((list: any) => list.name);
            this.filteredListNames = this.groupForm.get('listName')!.valueChanges.pipe(
              startWith(''),
              map(value => {
                const filterValue = value.toLowerCase();
                return this.listNames.filter(listName => listName.toLowerCase().includes(filterValue));
              })
            );
          }
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
    if (this.groupForm.contains('userIds')) {
      this.dataService.getUsers().subscribe({
        next: (response: any) => {
          if (response.length > 0) {
            this.users = response.map((user: any) => {
              return { id: user.id, username: user.username };
            });
            this.filteredUsers = this.groupForm.get('userIds')!.valueChanges.pipe(
              startWith(''),
              map(value => {
                const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
                return this.users.filter(user => user.username.toLowerCase().includes(filterValue)).map(user => {
                  return { id: user.id, username: user.username };
                });
              })
            );
          }
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  }

  displayListName(listName: string): string {
    return listName ? listName : '';
  }

  displayUser(user: any): string {
    return user ? user.username : '';
  }

  replaceSpacesWithUnderscores(event: any) {
    event.target.value = event.target.value.replace(/\s+/g, '_');
  }

  toggleUserSelection(user: any) {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
    this.groupForm.get('userIds')!.setValue(this.selectedUsers.map(u => u.id));
  }

  onSubmit() {
    if (!this.groupForm.valid) {
      return;
    }

    let result: any;
    if (this.data.formType === 'listName') {
      result = {
        listName: this.groupForm.value.listName
      };
    } else if (this.data.formType === 'userIds') {
      result = {
        users: this.selectedUsers.map(u => {
          return { id: u.id, username: u.username };
        })
      };
    } else if (this.data.formType === 'name') {
      result = {
        name: this.groupForm.value.name
      };
    } else {
      result = {
        name: this.groupForm.value.name,
        listName: this.isNewListName ? this.groupForm.value.newListName : this.groupForm.value.listName,
        users: this.selectedUsers.map(u => {
          return { id: u.id, username: u.username };
        })
      };
    }

    this.dialogResult = result;
    this.dialogRef.close(this.dialogResult);
  }
}
