import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryItemComponent } from './country-item.component';

describe('CountryItemComponent', () => {
  let component: CountryItemComponent;
  let fixture: ComponentFixture<CountryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
