import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopytextComponent } from './copytext.component';

describe('CopytextComponent', () => {
  let component: CopytextComponent;
  let fixture: ComponentFixture<CopytextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopytextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopytextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
