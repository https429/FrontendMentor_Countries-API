import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {CountryDTO, CountryService} from "../service/country.service";
import {AsyncPipe} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [
    AsyncPipe,
  ],
  templateUrl: './country-detail.component.html',
  styleUrl: './country-detail.component.scss'
})
export class CountryDetailComponent implements OnInit {
  countryDTO$!: Observable<CountryDTO>

  constructor(protected countryService: CountryService,
              private router: Router,
              private route: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(routeParams => {
      const countryName = routeParams['countryName']
      if (!countryName) {

        this.router.navigate(['/'])
          .then(_ => console.error("Empty Country Name, redirect to /"))
      }
      this.countryDTO$ = this.countryService.getCountryByName(countryName)
    })
  }

  getCountryPropertiesMap(countryDTO: CountryDTO): Map<string, string> {
    let propertiesMap = new Map<string, string>()
    const JOIN_SEPARATOR = ", "

    propertiesMap.set("Official Name", countryDTO.name.official)
    const nativeNames = Array.from(countryDTO.name.nativeName.values())
    propertiesMap.set("Native Name", nativeNames[nativeNames.length - 1].common)
    propertiesMap.set("Population", countryDTO.population.toLocaleString('en-us'))
    propertiesMap.set("Region", countryDTO.region)
    propertiesMap.set("Sub Region", countryDTO.subregion)
    propertiesMap.set("Capital", countryDTO.capital.join(JOIN_SEPARATOR))
    propertiesMap.set("Top Level Domain", countryDTO.tld.join(JOIN_SEPARATOR))
    const currencies = Array.from(countryDTO.currencies.values()).map(value => value.name)
    propertiesMap.set("Currencies", currencies.join(JOIN_SEPARATOR))
    propertiesMap.set("Languages", countryDTO.languages.join(JOIN_SEPARATOR))

    return propertiesMap
  }

  navigateBack(): void {
    // TODO: Make this Method better & Global
    this.router.navigate(['']).then()
  }

  navigateToCountry(cca3Code: string): void {
    const commonName = this.countryService.convertCCA3CodeToOfficialName(cca3Code)
    this.router.navigate(['/detail', commonName]).then()
  }
}
