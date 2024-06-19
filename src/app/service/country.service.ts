import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";

export type Region = string;
export type CountryDTO = {
  name: {
    common: string
    official: string
  }
  tld: string[]
  region: string
  subregion: string
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
  }
  startOfWeek: string

}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly BASE_URL: string = "https://restcountries.com/v3.1"
  private readonly FIELDS: string[] = [
    'name', 'tld', 'region', 'capital', 'latlng', 'area', 'maps', 'population', 'timezones', 'flags', 'startOfWeek',
    'country', 'flags'
  ];

  constructor(private http: HttpClient) {
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
      )
  }

  getCountriesByName(name: string): Observable<CountryDTO[]> {
    name = name.trim()
    if (name.length == 0) {
      return this.getAllCountries()
    }

    return this.http
      .get<CountryDTO[]>(
        `${this.BASE_URL}/name/${name}`, {
          params: {fields: this.FIELDS.join(',')}
        })
      .pipe(
        map(countryList => countryList.sort(this.countryCompare))
      )
  }

  private countryCompare(a: CountryDTO, b: CountryDTO): number {
    return a.name.common.localeCompare(b.name.common)
  }
}
