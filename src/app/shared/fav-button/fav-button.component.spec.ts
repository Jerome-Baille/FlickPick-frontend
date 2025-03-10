import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavButtonComponent } from './fav-button.component';

describe('FavButtonComponent', () => {
  let component: FavButtonComponent;
  let fixture: ComponentFixture<FavButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FavButtonComponent]
    });
    fixture = TestBed.createComponent(FavButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
