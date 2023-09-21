import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { VideoModalComponent } from './components/video-modal/video-modal.component';
import {MatDialogModule} from '@angular/material/dialog';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { LoaderComponent } from './components/loader/loader.component';
import { MediaTableViewComponent } from './components/media-table-view/media-table-view.component';
import { MatTableModule } from '@angular/material/table';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { ActionModalComponent } from './components/action-modal/action-modal.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { CreateGroupModalComponent } from './components/create-group-modal/create-group-modal.component';
import {MatOptionModule} from '@angular/material/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatChipsModule} from '@angular/material/chips';
import { FavButtonComponent } from './components/fav-button/fav-button.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatBadgeModule} from '@angular/material/badge';

@NgModule({
  declarations: [
    VideoModalComponent,
    LoaderComponent,
    MediaTableViewComponent,
    BackButtonComponent,
    ActionModalComponent,
    CreateGroupModalComponent,
    FavButtonComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    YouTubePlayerModule,
    MatTableModule,
    MatCheckboxModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatChipsModule,
    MatExpansionModule,
    MatBadgeModule
  ],
  exports: [
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    VideoModalComponent,
    YouTubePlayerModule,
    LoaderComponent,
    MatTableModule,
    MediaTableViewComponent,
    BackButtonComponent,
    MatCheckboxModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatChipsModule,
    FavButtonComponent,
    MatExpansionModule,
    MatBadgeModule
  ]
})
export class SharedModule { }
