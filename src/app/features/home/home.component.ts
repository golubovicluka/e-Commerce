import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from "rxjs";
import { ProductsService } from '../products/products.service';
import { ProductImageService } from 'src/app/shared/product-image.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  iphoneImg = "https://www.mobilplanet.net/wp-content/uploads/2022/10/0174519_apple-iphone-14-pro-max-128gb-gold_550.jpeg";
  iphoneId = 4;

  macbookImg = "https://img.gigatron.rs/img/products/large/image62becf4b4c714.png";
  macbookId = 1;

  ipadImg = "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/0ecd2826-5afe-555f-9b8c-f22f14b77e2b/eaa96650-7862-5a59-af1e-3ce2d1490176.jpg";
  ipadId = 13;

  suggestedProducts!: any;
  suggestedProductsSubscription!: Subscription;

  name!: any;

  carouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '480px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    private router: Router,
    private _productService: ProductsService,
    private _productImageService: ProductImageService
  ) { }

  ngOnInit() {
    this.suggestedProductsSubscription = this._productService.getSuggestedProducts().subscribe((products: any) => {
      this.suggestedProducts = products.data.product.map((product: any) => ({
        ...product,
        images: this._productImageService.normalizeImages(product.images, product.name)
      }));
    })
  }

  submitForm() {
  }

  redirect(id: number) {
    this.router.navigate(['/product', id]);
  }

  ngOnDestroy() {
    this.suggestedProductsSubscription.unsubscribe();
  }

}
