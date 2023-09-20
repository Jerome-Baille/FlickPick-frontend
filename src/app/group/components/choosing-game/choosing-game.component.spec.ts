import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosingGameComponent } from './choosing-game.component';

describe('ChoosingGameComponent', () => {
  let component: ChoosingGameComponent;
  let fixture: ComponentFixture<ChoosingGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChoosingGameComponent]
    });
    fixture = TestBed.createComponent(ChoosingGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
