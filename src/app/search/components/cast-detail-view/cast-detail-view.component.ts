import { Component } from '@angular/core';
import { TMDB_IMAGE_BASE_URL } from 'config/tmdb-api';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-cast-detail-view',
  templateUrl: './cast-detail-view.component.html',
  styleUrls: ['./cast-detail-view.component.sass']
})
export class CastDetailViewComponent {
  castData: any;
  crewData: any;
  TMDB_IMAGE_BASE_URL = TMDB_IMAGE_BASE_URL;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    // Retrieve data from local storage if available
    const castData = localStorage.getItem('castData');
    const crewData = localStorage.getItem('crewData');
    if (castData) {
      this.castData = JSON.parse(castData);
    } else {
      // Subscribe to data changes
      this.dataService.castData$.subscribe(data => {
        this.castData = data;
        // Store data in local storage
        localStorage.setItem('castData', JSON.stringify(data));
      });
    }

    if (crewData) {
      this.crewData = JSON.parse(crewData);
    } else {
      this.dataService.crewData$.subscribe(data => {
        this.crewData = data;
        // Store data in local storage
        localStorage.setItem('crewData', JSON.stringify(data));
      });
    }
  }

  ngOnDestroy(): void {
    // Remove data from local storage
    localStorage.removeItem('castData');
    localStorage.removeItem('crewData');
  }
}
