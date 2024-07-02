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
    // Load Regions Select
    this.regionList$ = this.countryService.getAllRegions()
    this.setUpForm()
    this.initFormByQueryParams()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  private setUpForm(): void {
    // Build Form
    this.filterForm = this.fb.group({
      searchInput: [''],
      regionSelect: [this.NOT_SELECTED]
    })

    // Update Query Params if form changes
    this.subscriptions.push(
      this.filterForm.valueChanges
        .pipe(
          throttle(() => interval(1000), {leading: false, trailing: true}),
        )
        .subscribe(this.updateQueryParams.bind(this))
    )

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
                  ? countryList.filter(country => country.name.common.includes(searchStr))
                  : countryList
              })
            )
        )
      )

    // Create Subscriptions to get notified if Input Value Change & Activate Reset Button
    this.subscriptions.push(
      this.searchInput.valueChanges.subscribe(value =>
        this.searchInputClearState = value ? 'active' : 'inactive'
      ))
    this.subscriptions.push(
      this.regionSelect.valueChanges.subscribe(value =>
        this.regionSelectClearState = value != this.NOT_SELECTED ? 'active' : 'inactive'
      ))
  }

  private initFormByQueryParams(): void {
    const searchVal: string | undefined = this.route.snapshot.queryParamMap.get(this.SEARCH_QUERY_PARAM)
      ?.trim().toLowerCase()
    const regionVal: string | undefined = this.route.snapshot.queryParamMap.get(this.REGION_QUERY_PARAM)
      ?.trim().toLowerCase()

    searchVal && this.searchInput.setValue(searchVal)
    regionVal && this.regionSelect.setValue(regionVal)
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      preserveFragment: true,
      queryParams: {
        ...(this.searchInput.value && {[this.SEARCH_QUERY_PARAM]: this.searchInput.value}),
        ...(this.regionSelect.value && this.regionSelect.value != this.NOT_SELECTED && {[this.REGION_QUERY_PARAM]: this.regionSelect.value}),
      },
    })
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
