import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) { }
}
