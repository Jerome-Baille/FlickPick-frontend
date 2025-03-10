import { Component } from '@angular/core';

@Component({
    selector: 'app-back-button',
    templateUrl: './back-button.component.html',
    styleUrls: ['./back-button.component.sass'],
    standalone: false
})
export class BackButtonComponent {
  goBack() {
    window.history.back();
  }
}
