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

  selectedMonthlyPayment: any = { name: 12 }
  monthlyPaymentOptions: any[] = [
    { name: 12 },
    { name: 24 },
    { name: 36 },
  ];

  suggestedProducts!: any[];

  public items!: MenuItem[];
  home!: MenuItem;

  galleryResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  carouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
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
      this._productService.getProductsByCategory(productCategory).subscribe((suggestedProducts: any) => {
        // TODO: filter out the currently selected item and remove it from suggestions list
        this.suggestedProducts = suggestedProducts.data.product;
        // Undefined when user reload the page or goes directly to this route
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
        })
      })
      this.inWishlist = this.checkInWishlist(this.id);
    }

    // Breadcrumbs setup
    this.setBreadcrumbItems();
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  getNumVisible(): number {
    const width = window.innerWidth;
    if (width <= 560) return 1;
    if (width <= 768) return 2;
    return 3;
  }

  navigateBack() {
    this._location.back();
  }

  checkInWishlist(id: number) {
    return this._wishlistService.inWishlist(id)
  }

  addProductToWishList(product: Product) {
    const itemInWishList = this.checkInWishlist(product.id);
    if (!itemInWishList) {
      this.addToWishList(product);
      this.inWishlist = true;
      this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to wishlist' })
    } else {
      this.removedFromWishList(product);
      this.inWishlist = false;
      this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' })
    }
  }

  // TODO: fix add and remove from wishlist
  addToWishlist(product: Product) {
  }

  removeFromWishlist(product: Product) {
  }

  addToCart(product: Product) {
    this._cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
    this._cartService.removeFromCart(product);
  }

  addToWishList(product: Product) {
    this._wishlistService.addWishListItem(product);
  }

  removedFromWishList(product: Product) {
    this._wishlistService.removeWishListItem(product);
  }

  checkIfInWishlist(product: Product) {
    return this._wishlistService.inWishlist(product.id);
  }

  // Move to service
  openProductDetails(id: number) {
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

    const navigationExtras: NavigationExtras = {
      state: {
        product
      }
    }
    this.router.navigate(['/product', id], navigationExtras);
  }

  getInstallmentPayAmount(price: number, months: any) {
    return Math.floor(price / months);
  }

  setBreadcrumbItems() {
    this.items = [
      { label: 'Products', routerLink: '/products/search' },
      { label: `${this.product?.name}`, routerLink: `/product/${this.product?.id}` }
    ];
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  replaceProduct(id: number) {
    const newProduct = this.suggestedProducts.find((p) => p.id == id)
    this.id = newProduct.id;
    this.inWishlist = this.checkIfInWishlist(newProduct.id);
    this.product = newProduct;
    this.images = newProduct.images;
    this.router.navigate(['/product', newProduct.id])
  }

  buyProduct(product: Product) {
    this._cartService.addToCart(product);
    this.router.navigate(['/cart'])
  }

  imageClick(index: number) {
    this.activeIndex = index;
    this.displayCustom = true;
  }

    protected readonly scrollY = scrollY;
}
