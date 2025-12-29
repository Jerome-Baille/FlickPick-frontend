import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-back-button',
    imports: [
      MatButtonModule,
      MatIconModule
    ],
    templateUrl: './back-button.component.html',
    styleUrls: ['./back-button.component.scss'],
    standalone: true
})
export class BackButtonComponent {
  goBack() {
    window.history.back();
  }
}
