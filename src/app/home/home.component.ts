import {Component, OnInit} from '@angular/core';
import {CountryDTO, CountryService, Region} from "../service/country.service";
import {interval, Observable, throttle} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {CountryItemComponent} from "../country-item/country-item.component";
import {Form, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe,
    CountryItemComponent,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  protected readonly NOT_SELECTED: string = 'undefined';

  regionList$!: Observable<Region[]>
  countryList$!: Observable<CountryDTO[]>

  filterForm: FormGroup = this.fb.group({
    searchInput: [''],
    regionSelect: [this.NOT_SELECTED]
  })

  constructor(private countryService: CountryService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.regionList$ = this.countryService.getAllRegions()
    this.countryList$ = this.countryService.getAllCountries()

  }

  get formSearchInput(): FormControl {
    return this.filterForm.get('searchInput') as FormControl
  }

  get formRegionSelect(): FormControl {
    return this.filterForm.get('regionSelect') as FormControl
  }
}
