import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProductsService } from '../../products.service';
import { MenuItem, MessageService } from 'primeng/api';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { Product } from '../../Product';
import { CartService } from 'src/app/shared/cart.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  images!: any[];
  product: any | null = null;
  id!: number;

  // Monthly payment options
  selectedMonthlyPayment: any = { name: 12 }
  monthlyPaymentOptions: any[] = [
    { name: 12 },
    { name: 24 },
    { name: 36 },
  ];

  suggestedProducts!: any[];

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

  inWishlist!: boolean;
  displayCustom!: boolean;

  activeIndex: number = 0;


  constructor(
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private router: Router,
    private _productService: ProductsService,
    private _wishlistService: WishlistService,
    private _cartService: CartService,
    private _messageService: MessageService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { product: any };
    if (state?.product) {
      this.id = state?.product.id;
      this.inWishlist = this.checkInWishlist(this.id)
      this.product = state?.product;
      this.images = state?.product.images

      // Suggested products
      const productCategory = state?.product.category?.name;
      console.log(state.product);

      this._productService.getProductsByCategory(productCategory).subscribe((suggestedProducts: any) => {
        this.suggestedProducts = suggestedProducts.data.product;
        // Undefined when user reload the page or goes directly to this route
        console.log(this.suggestedProducts);
      })
    }
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];

    // If user navigated manually to the route
    if (!this.product) {
      this._productService.getProductById(this.id).subscribe((product: any) => {
        this.product = product.data.product[0];
        this.images = product.data.product[0].images;
        this.setBreadcrumbItems();
        this.inWishlist = this.checkInWishlist(this.id);

        // Suggested products
        const productCategory = product.data.product[0].category?.name;
        this._productService.getProductsByCategory(productCategory).subscribe((suggestedProducts: any) => {
          this.suggestedProducts = suggestedProducts.data.product;
          console.log('this.product value: ', this.product);

          console.log(this.suggestedProducts);
        })
      })
      this.inWishlist = this.checkInWishlist(this.id);
    }

    // Breadcrumbs setup
    this.setBreadcrumbItems();
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  navigateBack() {
    this._location.back();
  }

  checkInWishlist(id: number) {
    return this._wishlistService.inWishlist(id)
  }

  addRemoveItemWishlist(product: Product, fromCarousel?: boolean) {
    console.log(product);

    if (!fromCarousel) {
      this.inWishlist = !this.inWishlist;
      if (this.inWishlist) {
        this.addToWishList(product);
        this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to wishlist' })
      } else {
        this.removedFromWishList(product);
        this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' })
      }
    } else {
      const itemInWishList = this._wishlistService.inWishlist(product.id);
      console.log("Item in wishlist: ", itemInWishList);

      if (!itemInWishList) {
        this.addToWishList(product);
        this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to wishlist' })
      } else {
        this.removedFromWishList(product);
        this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' })
      }
    }


  }

  addToWishList(product: Product) {
    this._wishlistService.addWishListItem(product);
    console.log('Added to wishlist: ', product);
  }

  removedFromWishList(product: Product) {
    this._wishlistService.removeWishListItem(product);
    console.log('Removed from wishlist: ', product);
  }

  // Move to service
  openProductDetails(id: number) {
    // TODO: find a Different way of doing this, this is only from preview -> details
    const product = {
      name: this.product.name,
      description: this.product.description,
      subcategory: this.product.subcategory,
      images: this.product.images,
      EAN: this.product.EAN,
      id,
      inStock: this.product.inStock,
      price: this.product.price
    }
    console.log(product);


    const navigationExtras: NavigationExtras = {
      state: {
        product
      }
    }
    this.router.navigate(['/products', id], navigationExtras);
  }

  getInstallmentPayAmount(price: number, months: any) {
    return Math.floor(price / months);
  }

  setBreadcrumbItems() {
    this.items = [
      { label: 'Products', routerLink: '/products' },
      { label: `${this.product?.name}`, routerLink: `/products/${this.product?.id}` }
    ];
  }

  buyProduct(product: Product) {
    this._cartService.addToCart(product);
    this.router.navigate(['/cart'])
  }

  imageClick(index: number) {
    this.activeIndex = index;
    this.displayCustom = true;
  }

}
