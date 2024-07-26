import {Component, Input} from '@angular/core';
import {CountryDTO} from "../service/country.service";
import {DecimalPipe} from "@angular/common";
import {Router} from "@angular/router";

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

  constructor(private router: Router) {
  }

  navigateToDetail(): void {
    if (this.country == null) return

    this.router.navigate(['/detail', this.country.name.common]).then()
  }
}
