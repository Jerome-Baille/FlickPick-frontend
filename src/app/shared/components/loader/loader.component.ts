import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.sass'],
    standalone: false
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) { }
}
