import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from './Product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  products: Product[] = [
    { id: 1, name: "Mechanical keyboard", description: "A new mechanical custom built keyboard", createdAt: new Date(), rating: 5, category: "PC Components" },
    { id: 2, name: "Gaming mouse", description: "Brand new gaming mouse", createdAt: new Date(), rating: 4, category: "PC Components" },
    { id: 3, name: "Gaming monitor", description: "144hz gaming monitor", createdAt: new Date(), rating: 5, category: "PC Components" },
  ]

  constructor() { }

  addProduct(product: Product) {
    this.products.push(product);
  }

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getByCategory(category: string): Observable<Product[]> {
    return of(this.products.filter((product) => product.category === category));
  }

}
