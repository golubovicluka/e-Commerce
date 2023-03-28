import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProductsService } from '../../products.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  images!: any[];
  product: any | null = null;

  public items!: MenuItem[];
  home!: MenuItem;

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  displayCustom!: boolean;

  activeIndex: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private router: Router,
    private _productService: ProductsService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { product: any };
    if (state?.product) {
      this.product = state?.product;
      this.images = state?.product.images
    }
  }

  ngOnInit() {
    let id: number = this.activatedRoute.snapshot.params['id'];
    if (!this.product) {
      this._productService.getProductById(id).subscribe((product: any) => {
        this.product = product.data.product[0];
        this.images = product.data.product[0].images;
        this.setBreadcrumbItems();
      })
    }
    this.setBreadcrumbItems();

    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  navigateBack() {
    this._location.back();
  }

  setBreadcrumbItems() {
    this.items = [
      { label: 'Products', routerLink: '/products' },
      { label: `${this.product?.name}`, routerLink: `/products/${this.product.id}` }
    ];
  }

  imageClick(index: number) {
    this.activeIndex = index;
    this.displayCustom = true;
  }

}
