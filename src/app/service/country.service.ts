import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";

export type Region = string;
export type CountryDTO = {
  cca3: string
  name: {
    common: string
    official: string
    // Needs Parsing - check parse function parseCountryDTO
    nativeName: Map<string, {
      official: string
      common: string
    }>
  }
  tld: string[]
  // Needs Parsing - check parse function parseCountryDTO
  currencies: Map<string, {
    name: string
    symbol: string
  }>
  region: string
  subregion: string
  // Needs Parsing - check parse function parseCountryDTO
  languages: string[]
  capital: string[]
  latlng: [number, number]
  landlocked: boolean
  area: number
  maps: string[]
  population: number
  timezones: string[]
  flags: {
    png: string
    svg: string
    alt: string
  }
  startOfWeek: string
  borders: string[]
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly BASE_URL: string = "https://restcountries.com/v3.1"
  private readonly FIELDS: string[] = [
    'name', 'tld', 'currencies', 'region', 'subregion', 'capital', 'latlng', 'area', 'maps', 'population', 'timezones',
    'flags', 'startOfWeek', 'country', 'flags', 'languages', 'cca3', 'borders'
  ];

  private cca3NameMap: Map<string, string> = new Map();

  constructor(private http: HttpClient) {
    this.initCCA3CommonNameMap()
  }

  getAllRegions(): Observable<Region[]> {
    return this.http
      .get<{ region: string }[]>(
        `${this.BASE_URL}/all`, {
          params: {fields: 'region'}
        })
      .pipe(
        map(response => response.map(item => item.region)),
        map(regions => Array.from(new Set(regions))),
        map(regions => regions.sort())
      )
  }

  getAllCountries(): Observable<CountryDTO[]> {
    return this.http
      .get<CountryDTO[]>(
        `${this.BASE_URL}/all`, {
          params: {fields: this.FIELDS.join(',')}
        })
      .pipe(
        map(countryList => countryList.sort(this.countryCompare)),
        map(countryList => countryList.map(this.parseCountryDTO))
      )
  }

  getCountriesByRegion(region: string): Observable<CountryDTO[]> {
    region = region.trim();
    if (region.length == 0) {
      return this.getAllCountries()
    }

    return this.http
      .get<CountryDTO[]>(
        `${this.BASE_URL}/region/${region}`, {
          params: {fields: this.FIELDS.join(',')}
        })
      .pipe(
        map(countryList => countryList.sort(this.countryCompare)),
        map(countryList => countryList.map(this.parseCountryDTO))
      )
  }

  getCountryByName(name: string): Observable<CountryDTO> {
    name = name.trim()

    return this.http
      .get<CountryDTO[]>(
        `${this.BASE_URL}/name/${name}`, {
          params: {fields: this.FIELDS.join(',')}
        })
      .pipe(
        map(countryList => countryList[0]),
        map(this.parseCountryDTO)
      )
  }

  convertCCA3CodeToOfficialName(cca3Code: string): string {
    cca3Code = cca3Code.trim().toUpperCase()
    if (cca3Code.length != 3) {
      throw new Error(`Invalid CCA3 Code: ${cca3Code}`)
    }

    let countryName = this.cca3NameMap.get(cca3Code)
    return countryName === undefined ? "" : countryName
  }

  private initCCA3CommonNameMap(): void {
    type RestAnswer = {
      name: {
        common: string
      }
      cca3: string
    }

    this.http
      .get<RestAnswer[]>(
        `${this.BASE_URL}/all`, {
          params: {fields: 'cca3,name'}
        }
      ).subscribe(response => {
        response.forEach(country => {
          this.cca3NameMap.set(country.cca3, country.name.common)
        })
    })
  }

  private parseCountryDTO(country: CountryDTO): CountryDTO {
    country.name.nativeName = new Map(Object.entries(country.name.nativeName))
    country.currencies = new Map(Object.entries(country.currencies))
    country.languages = Array.from(Object.entries(country.languages)).map(value => value[1])

    return country
  }

  private countryCompare(a: CountryDTO, b: CountryDTO): number {
    return a.name.common.localeCompare(b.name.common)
  }
}
