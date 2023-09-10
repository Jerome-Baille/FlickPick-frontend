import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-group-modal',
  templateUrl: './create-group-modal.component.html',
  styleUrls: ['./create-group-modal.component.sass']
})
export class CreateGroupModalComponent implements OnInit {
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  groupForm: FormGroup;
  isNewListName = false;
  users: any[] = []; // modified to store user objects instead of usernames
  listNames: string[] = [];
  dialogResult: any;
  filteredListNames!: Observable<string[]>;
  filteredUsers!: Observable<any[]>; // modified to store user objects instead of usernames
  selectedUsers: any[] = []; // modified to store user objects instead of usernames

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogRef: MatDialogRef<CreateGroupModalComponent>
  ) {
    this.groupForm = this.formBuilder.group({
      name: ['', Validators.required],
      listName: ['', Validators.required],
      userIds: [[], [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() {
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
    this.dataService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response.map((user: any) => ({ id: user.id, username: user.username })); // modified to store user objects instead of usernames
        this.filteredUsers = this.groupForm.get('userIds')!.valueChanges.pipe(
          startWith([]),
          map(value => {
            const filterValue = value.toLowerCase();
            return this.users.filter(user => user.username.toLowerCase().includes(filterValue)); // modified to filter by username
          })
        );
      },
      error: (error) => {
        console.log(error);
      }
    });
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

  toggleUserSelection(user: any) { // modified to accept a user object
    const index = this.selectedUsers.findIndex(u => u.id === user.id); // modified to find the user by id
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
    this.groupForm.get('userIds')!.setValue(this.selectedUsers.map(u => u.id)); // modified to store user ids
    this.userInput.nativeElement.value = '';
  }

  onSubmit() {
    if (!this.groupForm.valid) {
      return;
    }

    // Prepare the data to send back to the parent component
    const result = {
      name: this.groupForm.value.name,
      listName: this.isNewListName ? this.groupForm.value.newListName : this.groupForm.value.listName,
      userIds: this.selectedUsers.map(u => u.id) // modified to store user ids
    };

    // Set the dialogResult property with the result
    this.dialogResult = result;

    // Close the dialog with the result data
    this.dialogRef.close(this.dialogResult);
  }
}