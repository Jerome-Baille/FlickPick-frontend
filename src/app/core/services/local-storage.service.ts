import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  // Create a subject to emit events
  private itemRemovedSource = new Subject<void>();

  // Observable to subscribe to for item removed events
  itemRemoved$ = this.itemRemovedSource.asObservable();

  // Method to trigger item removed event
  triggerItemRemoved() {
    this.itemRemovedSource.next();
  }
}