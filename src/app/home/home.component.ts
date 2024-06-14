import {Component, OnInit} from '@angular/core';
import {CountryDTO, CountryService, Region} from "../service/country.service";
import {Observable} from "rxjs";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  regionList$!: Observable<Region[]>
  countryList$!: Observable<CountryDTO[]>

  constructor(private countryService: CountryService) {
  }

  ngOnInit(): void {
    this.regionList$ = this.countryService.getAllRegions()
    this.countryList$ = this.countryService.getAllCountries()
  }
}
