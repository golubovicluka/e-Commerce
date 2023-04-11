import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, of } from "rxjs";
import { ProductsService } from '../products/products.service';
import { Product } from '../products/Product';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  iphoneImg = "https://istyle.rs/media/catalog/product/cache/image/700x700/e9c3970ab036de70892d86c6d221abfe/c/z/czcs_iphone14promax_q422_space-black_pdp-images_position-1a_t_4_7.jpg";
  iphoneId = 4;

  macbookImg = "https://img.gigatron.rs/img/products/large/image62becf4b4c714.png";
  macbookId = 1;

  ipadImg = "https://istyle.rs/media/catalog/product/cache/image/700x700/e9c3970ab036de70892d86c6d221abfe/i/p/ipad_pro_q123_wi-fi_11_in_4th_generation_silver_pdp_image_position-1a__wwce_t_t_4.jpg";
  ipadId = 13;

  suggestedProducts!: any;
  suggestedProductsSubscription!: Subscription;

  name!: any;

  constructor(
    private router: Router,
    private _productService: ProductsService
  ) { }

  ngOnInit() {
    this.suggestedProductsSubscription = this._productService.getSuggestedProducts().subscribe((products: any) => {
      console.log(products);
      this.suggestedProducts = products.data.product;
    })
  }

  redirect(id: number) {
    this.router.navigate(['/products', id]);
  }

  ngOnDestroy() {
    this.suggestedProductsSubscription.unsubscribe();
  }

}
