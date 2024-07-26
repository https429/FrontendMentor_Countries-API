import {Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {CountryDetailComponent} from "./country-detail/country-detail.component";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'detail/:countryName',
    component: CountryDetailComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
