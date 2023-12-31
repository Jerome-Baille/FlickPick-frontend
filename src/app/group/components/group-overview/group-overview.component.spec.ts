import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupOverviewComponent } from './group-overview.component';

describe('GroupOverviewComponent', () => {
  let component: GroupOverviewComponent;
  let fixture: ComponentFixture<GroupOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupOverviewComponent]
    });
    fixture = TestBed.createComponent(GroupOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
