import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FontAwesomeModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  exports: [
    FontAwesomeModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class SharedModule { }
