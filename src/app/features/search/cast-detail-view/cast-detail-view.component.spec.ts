import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastDetailViewComponent } from './cast-detail-view.component';

describe('CastDetailViewComponent', () => {
  let component: CastDetailViewComponent;
  let fixture: ComponentFixture<CastDetailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CastDetailViewComponent]
    });
    fixture = TestBed.createComponent(CastDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
