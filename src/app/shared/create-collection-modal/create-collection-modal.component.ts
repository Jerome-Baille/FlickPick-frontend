import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-create-collection-modal',
    imports: [
      CommonModule,
      MatDialogModule,
      MatButtonModule,
      MatFormFieldModule,
      MatAutocompleteModule,
      MatChipsModule,
      MatInputModule,
      MatIconModule,
      FormsModule,
      ReactiveFormsModule
    ],
    templateUrl: './create-collection-modal.component.html',
    styleUrls: ['./create-collection-modal.component.scss'],
    standalone: true
})
export class CreateCollectionModalComponent implements OnInit {
  groupForm: FormGroup;
  isNewListName = false;
  listNames: string[] = [];
  dialogResult: any;
  filteredListNames!: Observable<string[]>;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private dialogRef: MatDialogRef<CreateCollectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { formType: 'name' | 'listName' | 'all' }
  ) {
    if (data.formType === 'listName') {
      this.groupForm = this.formBuilder.group({
        listName: ['', Validators.required]
      });
    } else if (data.formType === 'name') {
      this.groupForm = this.formBuilder.group({
        name: ['', Validators.required]
      });
    } else {
      this.groupForm = this.formBuilder.group({
        name: ['', Validators.required],
        listName: ['', Validators.required]
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
        error: (err: any) => {
          this.snackbarService.showError(err);
        }
      });
    }
  }

  getDialogTitle(): string {
    switch (this.data.formType) {
      case 'name':
        return 'Create New List';
      case 'listName':
        return 'Choose List';
      case 'all':
        return 'Create New Group';
      default:
        return 'Create';
    }
  }

  getNameLabel(): string {
    switch (this.data.formType) {
      case 'name':
        return 'List Name';
      case 'all':
        return 'Group Name';
      default:
        return 'Name';
    }
  }

  displayListName(listName: string): string {
    return listName ? listName : '';
  }

  replaceSpacesWithUnderscores(event: any) {
    event.target.value = event.target.value.replace(/\s+/g, '_');
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
    } else if (this.data.formType === 'name') {
      result = {
        name: this.groupForm.value.name
      };
    } else {
      result = {
        name: this.groupForm.value.name,
        listName: this.isNewListName ? this.groupForm.value.newListName : this.groupForm.value.listName
      };
    }

    this.dialogResult = result;
    this.dialogRef.close(this.dialogResult);
  }
}
