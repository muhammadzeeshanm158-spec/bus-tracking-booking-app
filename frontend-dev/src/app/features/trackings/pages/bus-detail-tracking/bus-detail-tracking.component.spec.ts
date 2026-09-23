import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusDetailTrackingComponent } from './bus-detail-tracking.component';

describe('BusDetailTrackingComponent', () => {
  let component: BusDetailTrackingComponent;
  let fixture: ComponentFixture<BusDetailTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusDetailTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusDetailTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
