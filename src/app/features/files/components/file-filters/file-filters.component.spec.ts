import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileFiltersComponent } from './file-filters.component';

describe('FileFiltersComponent', () => {
  let component: FileFiltersComponent;
  let fixture: ComponentFixture<FileFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileFiltersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
