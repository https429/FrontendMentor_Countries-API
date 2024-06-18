import {Component, Input} from '@angular/core';
import {CountryDTO} from "../service/country.service";
import {DecimalPipe} from "@angular/common";

@Component({
  selector: 'app-country-item',
  standalone: true,
  imports: [
    DecimalPipe
  ],
  templateUrl: './country-item.component.html',
  styleUrl: './country-item.component.scss'
})
export class CountryItemComponent {
  @Input()
  country: CountryDTO | null = null

}
