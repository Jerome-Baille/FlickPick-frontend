import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicModalComponent } from './basic-modal.component';

describe('BasicModalComponent', () => {
  let component: BasicModalComponent;
  let fixture: ComponentFixture<BasicModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BasicModalComponent]
    });
    fixture = TestBed.createComponent(BasicModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
