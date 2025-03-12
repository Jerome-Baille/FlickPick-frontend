import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TmdbService } from 'src/app/services/tmdb.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { environment } from 'src/environments/environment.prod';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

interface MediaResult {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  overview?: string;
}

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
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  TMDB_IMAGE_BASE_URL = environment.TMDB_IMAGE_BASE_URL;
  groupForm: FormGroup;
  searchCtrl = this.formBuilder.control('');
  filteredMedia!: Observable<MediaResult[]>;
  selectedMedia: MediaResult[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private tmdbService: TmdbService,
    private snackbarService: SnackbarService,
    private dialogRef: MatDialogRef<CreateCollectionModalComponent>
  ) {
    this.groupForm = this.formBuilder.group({
      name: ['', Validators.required]
    });

    this.filteredMedia = this.searchCtrl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.trim() && value.trim().length >= 2) {
          return this.tmdbService.searchMulti(value.trim()).pipe(
            map(response => response.results.filter((item: MediaResult) => 
              item.media_type === 'movie' || item.media_type === 'tv'
            ))
          );
        }
        return [];
      })
    );
  }

  ngOnInit() {}

  displayFn = (media: MediaResult): string => {
    if (!media) return '';
    const title = media.title || media.name || '';
    const year = this.getYear(media);
    return `${title}${year ? ` (${year})` : ''}`;
  }

  onOptionSelected(event: any): void {
    const media = event.option.value as MediaResult;
    if (!this.selectedMedia.find(m => m.id === media.id)) {
      this.selectedMedia.push(media);
    }
    this.searchCtrl.setValue('');
    setTimeout(() => {
        this.autocompleteTrigger.closePanel();
    });
  }

  getYear(media: MediaResult): string {
    const date = media.release_date || media.first_air_date;
    return date ? new Date(date).getFullYear().toString() : '';
  }

  removeMedia(media: MediaResult): void {
    const index = this.selectedMedia.findIndex(m => m.id === media.id);
    if (index >= 0) {
      this.selectedMedia.splice(index, 1);
    }
  }

  onGroupNameInput(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\s+/g, '_');
    this.groupForm.get('name')?.setValue(input.value);
  }

  onSubmit() {
    if (!this.groupForm.valid || this.selectedMedia.length === 0) {
      return;
    }

    const result = {
      name: this.groupForm.value.name,
      listName: this.groupForm.value.name.replace(/\s+/g, '_'),
      selectedMedia: this.selectedMedia.map(media => ({
        tmdbId: media.id,
        mediaType: media.media_type,
        title: media.title || media.name,
        releaseDate: media.release_date || media.first_air_date,
        posterPath: media.poster_path,
        overview: media.overview
      }))
    };

    this.dialogRef.close(result);
  }
}
