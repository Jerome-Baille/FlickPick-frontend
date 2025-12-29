import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header/header.component';
import { LoaderComponent } from './core/components/loader/loader.component';
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
