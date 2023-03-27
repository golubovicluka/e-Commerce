import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  product;

  constructor(private activatedRoute: ActivatedRoute, private _location: Location, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    console.log(navigation);
    const state = navigation?.extras.state as { product: any };
    this.product = state.product;
    console.log('state:', state);
    console.log(state.product);
  }

  ngOnInit() {
    let id: number = this.activatedRoute.snapshot.params['id'];
    if (!this.product) {
      // Get by id method...if user manually goes to products/1
    }
  }

  navigateBack() {
    this._location.back();
  }

}
