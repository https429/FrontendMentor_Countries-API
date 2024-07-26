import {Component, OnDestroy, OnInit} from '@angular/core';
import {CountryDTO, CountryService, Region} from "../service/country.service";
import {distinctUntilChanged, interval, map, Observable, startWith, Subscription, switchMap, throttle} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {CountryItemComponent} from "../country-item/country-item.component";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";

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
  protected readonly NOT_SELECTED: string = 'NOT_SELECTED'
  protected readonly SEARCH_QUERY_PARAM: string = 'search'
  protected readonly REGION_QUERY_PARAM: string = 'region'

  private subscriptions: Subscription[] = []

  regionList$!: Observable<Region[]>
  countryList$!: Observable<CountryDTO[]>

  filterForm!: FormGroup

  searchInputClearState: ButtonState = "inactive"
  regionSelectClearState: ButtonState = "inactive"

  constructor(private countryService: CountryService,
              private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,) {
  }

  ngOnInit(): void {
    // Build Form
    this.filterForm = this.fb.group({
      searchInput: [''],
      regionSelect: [this.NOT_SELECTED]
    })
    // Init Subscriptions
    this.initFormChangeListeners()
    this.initUpdateFormByQueryParams()
    // Define Observables
    this.regionList$ = this.countryService.getAllRegions()
    this.initCountryListObservable()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  private initCountryListObservable(): void {
    // Connect CountryService Observable to Component & Configure Filter Pipes
    this.countryList$ = this.regionSelect.valueChanges
      .pipe(
        startWith(this.regionSelect.value),
        distinctUntilChanged(),
        // Filter by Region via Rest-Endpoint
        switchMap(region => {
          const regionStr = region.trim()
          return regionStr == this.NOT_SELECTED
            ? this.countryService.getAllCountries()
            : this.countryService.getCountriesByRegion(regionStr)
        }),
        // Filter by Search Input Field
        switchMap(countryList =>
          this.searchInput.valueChanges
            .pipe(
              startWith(this.searchInput.value),
              map(search => {
                const searchStr = search.trim()
                return searchStr.length > 0
                  ? this.filterCountries(searchStr, countryList)
                  : countryList
              }))))
  }

  private initFormChangeListeners(): void {
    this.subscriptions.push(
      this.filterForm.valueChanges
        .pipe(
          throttle(() => interval(1000), {leading: false, trailing: true}))
        .subscribe(this.updateQueryParams.bind(this)),
      // Reset Buttons on Input & Select Field
      this.searchInput.valueChanges.subscribe(value =>
        this.searchInputClearState = value ? 'active' : 'inactive'),
      this.regionSelect.valueChanges.subscribe(value =>
        this.regionSelectClearState = value != this.NOT_SELECTED ? 'active' : 'inactive'),
    )
  }

  private initUpdateFormByQueryParams(): void {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(map => {
        // Returns parsed Query Param or Default Value
        const searchVal: string = (map.get(this.SEARCH_QUERY_PARAM)?.trim().toLowerCase()) || ''
        const regionVal: string = (map.get(this.REGION_QUERY_PARAM)?.trim().toLowerCase()) || this.NOT_SELECTED
        // Load and parse current form Values
        const currentSearchVal = this.searchInput.value.trim().toLowerCase()
        const currentRegionVal = this.regionSelect.value.trim().toLowerCase()
        // Only update the Form, if the query Value differs
        currentSearchVal !== searchVal && this.searchInput.setValue(searchVal)
        currentRegionVal !== regionVal && this.regionSelect.setValue(regionVal)
      }))
  }

  private updateQueryParams(): void {
    const queryParams: any = {}
    // Put trimmed and lowered filter strings into query
    if (this.searchInput.value) {
      queryParams[this.SEARCH_QUERY_PARAM] = this.searchInput.value.trim().toLowerCase()
    }
    if (this.regionSelect.value && this.regionSelect.value != this.NOT_SELECTED) {
      queryParams[this.REGION_QUERY_PARAM] = this.regionSelect.value.trim().toLowerCase()
    }

    this.router.navigate([], {
      relativeTo: this.route,
      preserveFragment: true,
      queryParams: queryParams,
    }).then()
  }

  private filterCountries(searchStr: string, countryList: CountryDTO[]): CountryDTO[] {
    return countryList.filter(country => {
        const countryName = country.name.common.toLowerCase()
        searchStr = searchStr.trim().toLowerCase()

        return countryName.includes(searchStr)
      }
    )
  }

  resetSearchInput(): void {
    this.searchInput.setValue('')
  }

  resetRegionSelect(): void {
    this.regionSelect.setValue(this.NOT_SELECTED)
  }

  get searchInput() {
    return this.filterForm.controls['searchInput'] as FormControl<string>
  }

  get regionSelect() {
    return this.filterForm.controls['regionSelect'] as FormControl<string>
  }
}
