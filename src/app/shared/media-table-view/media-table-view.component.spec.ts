import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaTableViewComponent } from './media-table-view.component';

describe('MediaTableViewComponent', () => {
  let component: MediaTableViewComponent;
  let fixture: ComponentFixture<MediaTableViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MediaTableViewComponent]
    });
    fixture = TestBed.createComponent(MediaTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
