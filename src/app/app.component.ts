import { Component } from '@angular/core';
import { CoreModule } from "./core/core.module";
import { HeaderComponent } from './core/components/header/header.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { RouterOutlet } from '@angular/router';
@Component({
    selector: 'app-root',
    imports: [CoreModule, HeaderComponent, LoaderComponent, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    standalone: true
})
export class AppComponent {
  title = 'flick-pick';
}
