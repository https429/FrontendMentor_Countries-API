import {Component, OnDestroy, OnInit} from '@angular/core';
import {CountryDTO, CountryService, Region} from "../service/country.service";
import {distinctUntilChanged, map, Observable, startWith, Subscription, switchMap} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {CountryItemComponent} from "../country-item/country-item.component";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";

type ButtonState = 'active' | 'inactive'

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
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []
  protected readonly NOT_SELECTED: string = 'NOT_SELECTED'

  regionList$!: Observable<Region[]>
  countryList$!: Observable<CountryDTO[]>

  filterForm: FormGroup

  searchInputClearState: ButtonState = "inactive"
  regionSelectClearState: ButtonState = "inactive"

  constructor(private countryService: CountryService,
              private fb: FormBuilder) {

    this.filterForm = this.fb.group({
      searchInput: [''],
      regionSelect: [this.NOT_SELECTED]
    })
  }

  ngOnInit(): void {
    this.regionList$ = this.countryService.getAllRegions()

    this.countryList$ = this.regionSelect.valueChanges
      .pipe(
        startWith(this.regionSelect.value),
        distinctUntilChanged(),
        switchMap(region => {

          const regionStr = region.trim()
          return regionStr == this.NOT_SELECTED
            ? this.countryService.getAllCountries()
            : this.countryService.getCountriesByRegion(regionStr)
        }),
        switchMap(countryList =>
          this.searchInput.valueChanges
            .pipe(
              startWith(this.searchInput.value),
              map(search => {
                const searchStr = search.trim()
                return searchStr.length > 0
                  ? this.filterCountries(searchStr, countryList)
                  : countryList
              })
            )
        )
      )

    this.subscriptions.push(
      this.searchInput.valueChanges.subscribe(value =>
        this.searchInputClearState = value ? 'active' : 'inactive'
      ))
    this.subscriptions.push(
      this.regionSelect.valueChanges.subscribe(value =>
        this.regionSelectClearState = value != this.NOT_SELECTED ? 'active' : 'inactive'
      ))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  resetSearchInput(): void {
    this.searchInput.setValue('')
  }

  resetRegionSelect(): void {
    this.regionSelect.setValue(this.NOT_SELECTED)
  }

  private filterCountries(searchStr: string, countryList: CountryDTO[]): CountryDTO[] {
    return countryList.filter(country =>
      country.name.common.includes(searchStr)
    )
  }

  get searchInput() {
    return this.filterForm.controls['searchInput'] as FormControl<string>
  }

  get regionSelect() {
    return this.filterForm.controls['regionSelect'] as FormControl<string>
  }
}
