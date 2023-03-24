import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from './Product';
import { Apollo, ApolloBase, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private apollo: Apollo) {
  }

  // Get all products
  getProducts() {
    return this.apollo
      .watchQuery({
        query: gql`
          {
            product {
            id
            category
            description
            images
            inStock
            name
            price
            productId
            subCategory
            }
          }
        `,
      })
      .valueChanges
  }
}
