import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDetailViewComponent } from './search-detail-view.component';

describe('SearchDetailViewComponent', () => {
  let component: SearchDetailViewComponent;
  let fixture: ComponentFixture<SearchDetailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchDetailViewComponent]
    });
    fixture = TestBed.createComponent(SearchDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
