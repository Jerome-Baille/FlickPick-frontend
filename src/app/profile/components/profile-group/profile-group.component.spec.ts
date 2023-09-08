import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileGroupComponent } from './profile-group.component';

describe('ProfileGroupComponent', () => {
  let component: ProfileGroupComponent;
  let fixture: ComponentFixture<ProfileGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileGroupComponent]
    });
    fixture = TestBed.createComponent(ProfileGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
