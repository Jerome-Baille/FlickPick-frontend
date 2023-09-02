import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { faCircleCheck, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { TMDB_IMAGE_BASE_URL } from 'config/tmdb-api';

@Component({
  selector: 'app-search-result-card',
  templateUrl: './search-result-card.component.html',
  styleUrls: ['./search-result-card.component.sass']
})
export class SearchResultCardComponent {
  @Input() result: any;
  TMDB_IMAGE_BASE_URL = TMDB_IMAGE_BASE_URL;

  faCircleCheck = faCircleCheck;
  faCirclePlus = faCirclePlus;

  constructor(private router: Router) { }

  getMediaType(): string {
    if (this.result.title) {
      return 'movie';
    } else if (this.result.name) {
      return 'tv';
    }
    return '';
  }

  onCardClick(event: any) {
    event.stopPropagation();
    let media_type = this.getMediaType();
    const storedIdsString = localStorage.getItem('storedIds');
    let storedIds = storedIdsString ? JSON.parse(storedIdsString) : [];
    const index = storedIds.findIndex((item: { id: number, media_type: string }) => item.id === this.result.id);
    if (index === -1) {
      storedIds.push({ id: this.result.id, media_type });
    } else {
      storedIds.splice(index, 1);
    }
    localStorage.setItem('storedIds', JSON.stringify(storedIds));
  }

  isChecked(id: number): boolean {
    const storedIdsString: string | null = localStorage.getItem('storedIds');
    const storedIds: { id: number, media_type: string }[] = storedIdsString ? JSON.parse(storedIdsString) : [];
    return storedIds.some(item => item.id === id);
  }

  onNavigateToDetail() {
    this.router.navigate(['/media/detail', this.getMediaType(), this.result.id], { state: { media: this.result } });
  }
}
