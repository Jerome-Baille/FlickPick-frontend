import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { RouterOutlet } from '@angular/router';
@Component({
    selector: 'app-root',
    imports: [HeaderComponent, LoaderComponent, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true
})
export class AppComponent {
  title = 'flick-pick';
  currentYear = new Date().getFullYear();
}
