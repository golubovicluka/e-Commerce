import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProductsService } from '../../products.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  product: any | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private router: Router,
    private _productService: ProductsService
  ) {
    const navigation = this.router.getCurrentNavigation();
    console.log(navigation);
    const state = navigation?.extras.state as { product: any };
    if (state?.product) {
      this.product = state?.product;
    }
  }

  ngOnInit() {
    let id: number = this.activatedRoute.snapshot.params['id'];
    if (!this.product) {
      // Get by id method...if user manually goes to products/1
      this._productService.getProductById(id).subscribe((product: any) => {
        console.log(product);
        this.product = product.data.product[0];
      })
    }
  }

  navigateBack() {
    this._location.back();
  }

}
