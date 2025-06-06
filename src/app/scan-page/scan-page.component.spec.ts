import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanPageComponent } from './scan-page.component';

describe('ScanPageComponent', () => {
  let component: ScanPageComponent;
  let fixture: ComponentFixture<ScanPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
