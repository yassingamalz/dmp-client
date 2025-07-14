import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachinePerformanceCardComponent } from './machine-performance-card.component';

describe('MachinePerformanceCardComponent', () => {
  let component: MachinePerformanceCardComponent;
  let fixture: ComponentFixture<MachinePerformanceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MachinePerformanceCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachinePerformanceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
